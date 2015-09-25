"use strict";

function Patch(patchStr) {
    this.raw = patchStr; // unified diffs
    this.data = this._calculate();
}

Patch.prototype.getUnifiedDiffJsx = function() {
    return (
        <table>
        <tbody>
        {this.data.map(function(dataLine) {
            return <tr className={"Patch_type_" + dataLine.type}>
                <td>{dataLine.oldNum}</td>
                <td>{dataLine.newNum}</td>
                <td>{dataLine.raw}</td>
            </tr>
        })}
        </tbody>
        </table>
    )
};

Patch.prototype.getSideBySideDiffJsx = function() {
    var sideBySide = this._calculateSideBySide();

    return (
        <table className="Patch_table"><tr><td>
            <table className="Patch_table_left">
            <tbody>
            {sideBySide.old.map(function(dataLine) {
                return (
                    <tr className={"Patch_type_" + dataLine.type}>
                        <td>{dataLine.oldNum}</td>
                        <td>{dataLine.raw}</td>
                    </tr>
                );
            })}
            </tbody>
            </table>
        </td><td>
            <table className="Patch_table_right">
            <tbody>
            {sideBySide.new.map(function(dataLine) {
                return (
                    <tr className={"Patch_type_" + dataLine.type}>
                        <td>{dataLine.newNum}</td>
                        <td>{dataLine.raw}</td>
                    </tr>
                );
            })}
            </tbody>
            </table>
        </td></tr></table>
    )
};

/**
 * Convert a raw patch file into an array of objects (one per line) containing
 * parsed information for that line.
 */
Patch.prototype._calculate = function() {
    // @@ -1,6 +1,7 @@
    // @@ from,#lines from,#lines
    var types = {
        "+": "add",
        "-": "del",
        " ": "nop",
        "@": "hunk"
    };

    var currentHunk = null;
    var patchData = this.raw.split("\n").map(function(line) {
        var lineType = types[line[0]];
        var lineJson = {
            raw: line,
            type: lineType
        };

        if (lineType === "hunk") {
            var hunkData = /^@@ -(\d+),\d+ \+(\d+),\d+ @@.*/.exec(line);
            if (!hunkData) {
                hunkData = /^@@ -(\d+),\d+ \+(\d+) @@.*/.exec(line);
            }
            currentHunk = {
                oldLineNo: parseInt(hunkData[1]),
                newLineNo: parseInt(hunkData[2]),
                oldLineCount: 0,
                newLineCount: 0
            };
            return lineJson;
        }

        if (currentHunk === null) {
            throw new Exception(
                "Expected patch to start with a hunk like @@ -1,2 +3,4 @@"
            );
        }
        // Algorithm:
        // DEL always line increments the old file only (you can't remove from
        //     the new file!)
        // ADD always line increments the new file only (you can't add to the
        //     old file else it'll be a NOP!)
        // NOP always line increments both files
        if (lineType === "add") {
            lineJson.newNum = currentHunk.newLineNo + currentHunk.newLineCount;
            currentHunk.newLineCount += 1;
        }
        else if (lineType === "del") {
            lineJson.oldNum = currentHunk.oldLineNo + currentHunk.oldLineCount;
            currentHunk.oldLineCount += 1;
        }
        else if (lineType === "nop") {
            lineJson.oldNum = currentHunk.oldLineNo + currentHunk.oldLineCount;
            lineJson.newNum = currentHunk.newLineNo + currentHunk.newLineCount;
            currentHunk.oldLineCount += 1;
            currentHunk.newLineCount += 1;
        }
        return lineJson;
    });

    // ======== Single line contextual diffs ========
    // rescan the patch looking for oppertunities to do contextual highlighting
    // of certain characters. This happens when you have the following pattern
    // of line types:
    //    anything but DEL,
    //    DEL,
    //    ADD,
    //    anything but ADD
    // We can then just do a basic char by char diff on those 2 lines to highlight.
    var patternMatcher = new PatternMatcher();

    // add dummy line to aid matching (beginning of file needs to be matchable)
    patternMatcher.accumulate("anything", {});

    function checkMatch(line) {
        patternMatcher.accumulate(line.type, line);
        if (patternMatcher.hasMatch()) {
            /* TODO
            var delLineData = patternMatcher.getReverseItem(2);
            var addLineData = patternMatcher.getReverseItem(1);

            // do char diffs (find largest prefix/suffix matches and highlight the rest)
            var dLine = delLineData.raw;
            var aLine = addLineData.raw;
            var maxLen = Math.max(dLine.length, aLine.length);
            var prefixLength = null;
            var suffixLength = null;
            for (var charNum = 0; charNum < maxLen; charNum++) {
                // mark the position of the largest prefix
                if (prefixLength === null) {
                    if (aLine[charNum] !== dLine[charNum]) {
                        prefixLength = charNum;
                        break;
                    }
                }
            }
            delLineData.lineDiff = {
                from: prefixLength,
                to: undefined // TODO
            };
            addLineData.lineDiff = {
                from: prefixLength,
                to: undefined // TODO
            };
            console.log("Got diff:");
            console.log(dLine.slice(0, prefixLength) + "@" + dLine.slice(prefixLength));
            console.log(aLine.slice(0, prefixLength) + "@" + aLine.slice(prefixLength));
            */
        }
    }

    patchData.forEach(checkMatch);

    // add dummy line to aid matching (EOF needs to be matchable)
    checkMatch({type: "anything"});

    return patchData;
}

Patch.prototype._calculateSideBySide = function() {
    // Diffs can be split into "only additions", "only deletions" and "both add/del".
    // For only additions => old file has blank line, new file has addition
    // For only deletions => old file has deletion, new file has blank line
    // For both => both sections start on the same line (del=left, add=right),
    //             mismatched lengths are inserted with blank lines.
    //
    // The "both" use case is tricky because we can't do a single sweep to insert
    // rows (deletions happen first so it'll be treated as "only deletions" until
    // it sees the "additions" block!). The algorithm we use "looks ahead" on
    // deletion blocks to see if it is really a "both" block and acts accordingly.
    var oldFile = [];
    var newFile = [];

    var inBothBlock = false;
    var bothBlockAdditionOffset = -1;
    var bothBlockEndLineNum = -1;
    // Example Both Block:
    //    no change
    //  - first line              no change    |   no change
    //  - second line           - first line   | + 1st line
    //  + 1st line       ===>   - second line  | + 2nd line
    //  + 2nd line                [ blank ]    | + 3rd line
    //  + 3rd line
    // bothBlockEndLineNum = 6
    // bothBlockAdditionOffset = 2 (jump 2 forward to get the addition line)
    var prevLineType = null;
    for (var lineNum = 0; lineNum < this.data.length; lineNum++) {
        var line = this.data[lineNum];

        // check if we should start being in a both block
        if (!inBothBlock && prevLineType === "nop" && line.type === "del") {
            bothBlockEndLineNum = -1;
            // look ahead - we may transition into a both block
            var seenAddition = false;
            for (var i = lineNum+1; i < this.data.length; i++) {
                var nextLine = this.data[i];
                // a both block has to be a contiguous section of dels/adds
                if (nextLine.type !== "del" && nextLine.type !== "add") {
                    bothBlockEndLineNum = i;
                    break;
                }
                // we MUST see an add for this to be a both block (vs just del)
                if (!seenAddition && nextLine.type === "add") {
                    bothBlockAdditionOffset = i - lineNum;
                    seenAddition = true;
                }
            }

            if (seenAddition) {
                if (bothBlockEndLineNum === -1) {
                    // the both block ends at EOF
                    bothBlockEndLineNum = this.data.length;
                }
                inBothBlock = true;
            }
        }
        // check if we should stop being in a both block
        else if (inBothBlock && line.type !== "add" && line.type !== "del") {
            inBothBlock = false;
        }

        if (inBothBlock) {
            // dels come first in a del block
            var delLine = line.type === "del" ? line : { type: "blank", raw: " " };
            // adds come 2nd, so we need to add the offset
            var addLine = this.data[lineNum + bothBlockAdditionOffset];
            // it's possible that 'addLine' is beyond the bounds of the both block
            if (!addLine || lineNum + bothBlockAdditionOffset >= bothBlockEndLineNum) {
                addLine = { type: "blank", raw: " "};
            }
            // unified diffs are longer than side-by-sides, so we can't just add
            // lines for each loop we do. They condense in the both block when
            // there is nothing to add to both tables, so check that here.
            if (delLine.type === "blank" && addLine.type === "blank") {
                continue;
            }
            oldFile.push(delLine);
            newFile.push(addLine);
        }
        else {
            switch (line.type) {
                case "add":
                    oldFile.push({ type: "blank", raw: " " });
                    newFile.push(line);
                    break;
                case "del":
                    oldFile.push(line);
                    newFile.push({ type: "blank", raw: " " });
                    break;
                case "nop":
                case "hunk":
                    oldFile.push(line);
                    newFile.push(line);
                    break;
            }
        }
        prevLineType = line.type;
    }

    return {
        "old": oldFile,
        "new": newFile
    };
};

Patch.prototype.getRaw = function() {
    return this.raw;
}


function PatternMatcher() {
    this.items = [];
}

PatternMatcher.prototype.accumulate = function(entity, data) {
    this.items.push({
        entity: entity,
        data: data
    });
};

PatternMatcher.prototype.getReverseItem = function(index) {
    var item = this.items[
        this.items.length - (1 + index)
    ];
    if (item) {
        return item.data;
    }
    return null;
};

PatternMatcher.prototype.hasMatch = function() {
    // hard-coded for now but could be factored out if we need PatternMatcher
    // elsewhere.
    var reversePattern = [
        "^add", "add", "del", "^del"
    ];

    // loop backwards for efficiency.
    var counter = 0;
    for (var i = (this.items.length - 1); i >= 0; i--) {
        var itemToMatch = reversePattern[counter].replace(/\^/g, "");
        var isItemNegated = (reversePattern[counter][0] === "^");

        var negationMatch = (
            isItemNegated && this.items[i].entity !== itemToMatch
        );
        var normalMatch = (
            !isItemNegated && this.items[i].entity === itemToMatch
        );

        if (negationMatch || normalMatch) {
            counter += 1;
            if (counter === reversePattern.length) {
                // reached the end of the pattern
                return true;
            }
        }
        else {
            // don't bother going further (this works because we rely on the
            // caller to invoke hasMatch each time something is accumulated)
            return false;
        }
    }
    return false;
};

module.exports = Patch;
