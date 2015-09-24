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
