/* @flow */
"use strict";
import Line from "./line";

class PatternMatcher {
    items: Array<Object>;

    constructor() {
        this.items = [];
    }

    accumulate(entity: any, data: any) {
        this.items.push({
            entity: entity,
            data: data
        });
    }

    getReverseItem(index: number): ?any {
        var item = this.items[
            this.items.length - (1 + index)
        ];
        if (item) {
            return item.data;
        }
        return null;
    }

    hasMatch(): boolean {
        // hard-coded for now but could be factored out if we need PatternMatcher
        // elsewhere.
        var reversePattern = [
            "^" + Line.TYPE_ADD, Line.TYPE_ADD, Line.TYPE_DEL, "^" + Line.TYPE_DEL
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
    }
}

class Patch {

    raw: string;
    unified: Array<Object>;
    sideBySide: Object;

    constructor(patchStr: string) {
        this.raw = patchStr; // unified diffs
        var lineData = Patch.calculateLineData(this.raw);
        this.unified = lineData;
        this.sideBySide = Patch.calculateSideBySide(lineData);
    }

    getUnifiedData(): Array<Object> {
        return this.unified;
    }

    getSideBySideData(): Object {
        return this.sideBySide;
    }

    getRaw(): string {
        return this.raw;
    }

    setMaxLines(num: number) {
        if (this.unified.length > num) {
            this.unified = this.unified.splice(num * -1);
        }
        if (this.sideBySide.old.length > num) {
            this.sideBySide.old = this.sideBySide.old.splice(num * -1);
            this.sideBySide.new = this.sideBySide.new.splice(num * -1);
        }
    }

    getLinePosition(line: Line): number {
        for (var i = 0; i < this.unified.length; i++) {
            if (line.matches(this.unified[i])) {
                return i;
            }
        }
        return -1;
    }

    getLastLine(): ?Line {
        return this.unified[this.unified.length - 1];
    }

    /**
     * @static
     * Calculate the side by side rows for each table from unified line data.
     * @return {Object} With 'old' and 'new' keys which have Line[] values.
     */
    static calculateSideBySide(data: Array<Object>): Object {
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
        for (var lineNum = 0; lineNum < data.length; lineNum++) {
            var line = data[lineNum];

            // check if we should start being in a both block
            if (!inBothBlock && prevLineType === Line.TYPE_NOP &&
                    line.getType() === Line.TYPE_DEL) {
                bothBlockEndLineNum = -1;
                // look ahead - we may transition into a both block
                var seenAddition = false;
                for (var i = lineNum+1; i < data.length; i++) {
                    var nextLine = data[i];
                    // a both block has to be a contiguous section of dels/adds
                    if (nextLine.getType() !== Line.TYPE_DEL &&
                            nextLine.getType() !== Line.TYPE_ADD) {
                        bothBlockEndLineNum = i;
                        break;
                    }
                    // we MUST see an add for this to be a both block (vs just del)
                    if (!seenAddition && nextLine.getType() === Line.TYPE_ADD) {
                        bothBlockAdditionOffset = i - lineNum;
                        seenAddition = true;
                    }
                }

                if (seenAddition) {
                    if (bothBlockEndLineNum === -1) {
                        // the both block ends at EOF
                        bothBlockEndLineNum = data.length;
                    }
                    inBothBlock = true;
                }
            }
            // check if we should stop being in a both block
            else if (inBothBlock && line.getType() !== Line.TYPE_ADD &&
                    line.getType() !== Line.TYPE_DEL) {
                inBothBlock = false;
            }

            if (inBothBlock) {
                // dels come first in a del block
                var delLine = (
                    line.getType() === Line.TYPE_DEL ? line : new Line(Line.TYPE_BLANK, " ")
                );
                // adds come 2nd, so we need to add the offset
                var addLine = data[lineNum + bothBlockAdditionOffset];
                // it's possible that 'addLine' is beyond the bounds of the both block
                if (!addLine || lineNum + bothBlockAdditionOffset >= bothBlockEndLineNum) {
                    addLine = new Line(Line.TYPE_BLANK, " ");
                }
                // unified diffs are longer than side-by-sides, so we can't just add
                // lines for each loop we do. They condense in the both block when
                // there is nothing to add to both tables, so check that here.
                if (delLine.getType() === Line.TYPE_BLANK &&
                        addLine.getType() === Line.TYPE_BLANK) {
                    continue;
                }
                oldFile.push(delLine);
                newFile.push(addLine);
            }
            else {
                switch (line.getType()) {
                    case Line.TYPE_ADD:
                        oldFile.push(new Line(Line.TYPE_BLANK, " "));
                        newFile.push(line);
                        break;
                    case Line.TYPE_DEL:
                        oldFile.push(line);
                        newFile.push(new Line(Line.TYPE_BLANK, " "));
                        break;
                    case Line.TYPE_NOP:
                    case Line.TYPE_HUNK:
                        oldFile.push(line);
                        newFile.push(line);
                        break;
                    default:
                        break;
                }
            }
            prevLineType = line.getType();
        }

        return {
            "old": oldFile,
            "new": newFile
        };
    }

    /**
     * @static
     * Convert a raw patch file into an array of objects (one per line) containing
     * parsed information for that line.
     * @return {Line[]}
     */
    static calculateLineData(raw: string): Array<Line> {
        // @@ -1,6 +1,7 @@
        // @@ from,#lines from,#lines
        // NB: #lines can be missing if it is just 1 line (yay :/)
        var types = {
            "+": Line.TYPE_ADD,
            "-": Line.TYPE_DEL,
            " ": Line.TYPE_NOP,
            "@": Line.TYPE_HUNK,
            "\\": Line.TYPE_NOP
        };

        var currentHunk = null;
        var lineList = raw.split("\n").map(function(line) {
            var lineType = types[line[0]];
            var lineObj = new Line(lineType, line);

            if (lineType === Line.TYPE_HUNK) {
                var hunkData = /^@@ -(\d+),\d+ \+(\d+),\d+ @@.*/.exec(line); // @@ -1,2 +3,4 @@
                if (!hunkData) {
                    hunkData = /^@@ -(\d+),\d+ \+(\d+) @@.*/.exec(line); // @@ -1,2 +3 @@
                }
                if (!hunkData) {
                    hunkData = /^@@ -(\d+) \+(\d+),\d+ @@.*/.exec(line); // @@ -1 +2,3 @@
                }
                if (!hunkData) {
                    hunkData = /^@@ -(\d+) \+(\d+) @@.*/.exec(line) // @@ -1 +1 @@
                }
                currentHunk = {
                    oldLineNo: parseInt(hunkData[1]),
                    newLineNo: parseInt(hunkData[2]),
                    oldLineCount: 0,
                    newLineCount: 0
                };
                return lineObj;
            }

            if (currentHunk === null) {
                throw new Error(
                    "Expected patch to start with a hunk like @@ -1,2 +3,4 @@"
                );
            }
            // Algorithm:
            // DEL always line increments the old file only (you can't remove from
            //     the new file!)
            // ADD always line increments the new file only (you can't add to the
            //     old file else it'll be a NOP!)
            // NOP always line increments both files
            if (lineType === Line.TYPE_ADD) {
                lineObj.setNewFileLineNum(currentHunk.newLineNo + currentHunk.newLineCount);
                currentHunk.newLineCount += 1;
            }
            else if (lineType === Line.TYPE_DEL) {
                lineObj.setOldFileLineNum(currentHunk.oldLineNo + currentHunk.oldLineCount);
                currentHunk.oldLineCount += 1;
            }
            else if (lineType === Line.TYPE_NOP) {
                lineObj.setOldFileLineNum(currentHunk.oldLineNo + currentHunk.oldLineCount);
                lineObj.setNewFileLineNum(currentHunk.newLineNo + currentHunk.newLineCount);
                currentHunk.oldLineCount += 1;
                currentHunk.newLineCount += 1;
            }
            return lineObj;
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
                var delLineObj = patternMatcher.getReverseItem(2);
                var addLineObj = patternMatcher.getReverseItem(1);
                if (!delLineObj || !addLineObj) {
                    return;
                }

                // do char diffs (find largest prefix/suffix matches and highlight the rest)
                // we substring 1 here because the first char is either + or -
                var dLine = delLineObj.getRawLine().substring(1);
                var aLine = addLineObj.getRawLine().substring(1);
                var maxLen = Math.max(dLine.length, aLine.length);
                var charNum;
                var prefixLength = 0;
                var suffixLength = 0;
                // find the largest prefix first
                for (charNum = 0; charNum < maxLen; charNum++) {
                    if (aLine[charNum] !== dLine[charNum]) {
                        prefixLength = charNum;
                        break;
                    }
                }

                // now find the largest suffix
                for (charNum = 0; charNum < maxLen; charNum++) {
                    var dSuffixIndex = dLine.length - charNum - 1;
                    var aSuffixIndex = aLine.length - charNum - 1;
                    // we must make sure that the prefix/suffix pointers don't cross else we'll
                    // duplicate the overlapped chars in the final output. E.g.
                    // DEL: 'python', 'build.py',
                    // ADD: 'python', 'build.py', "-v",
                    // Would naively produce:
                    // PREFIX: 'python', 'build.py',
                    // SUFFIX: ,
                    // But we've counted that end comma twice in the DEL string! We fix this by
                    // adding an extra termination rule for overlaps.
                    if (dSuffixIndex <= (prefixLength-1) || aSuffixIndex <= (prefixLength-1)) {
                        suffixLength = charNum;
                        break;
                    }
                    // this is the same as the prefix match but in reverse
                    if (dSuffixIndex >= 0 && aSuffixIndex >= 0) {
                        if (aLine[aSuffixIndex] !== dLine[dSuffixIndex]) {
                            suffixLength = charNum;
                            break;
                        }
                    }
                }

                // add one to prefixLength to accomodate for that starting + or -
                delLineObj.setHighlightRange(
                    prefixLength + 1, delLineObj.getRawLine().length - suffixLength
                );
                addLineObj.setHighlightRange(
                    prefixLength + 1, addLineObj.getRawLine().length - suffixLength
                );
            }
        }

        lineList.forEach(checkMatch);

        // add dummy line to aid matching (EOF needs to be matchable)
        checkMatch({type: "anything"});

        return lineList;
    }
}

module.exports = Patch;
