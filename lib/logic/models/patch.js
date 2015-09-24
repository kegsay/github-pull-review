"use strict";

function Patch(patchStr) {
    this.raw = patchStr; // unified diffs
    this.data = this._jsonify();
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
Patch.prototype._jsonify = function() {
    // @@ -1,6 +1,7 @@
    // @@ from,#lines from,#lines
    var types = {
        "+": "add",
        "-": "del",
        " ": "nop",
        "@": "hunk"
    };

    var prevLine = null;
    var currentHunk = null;
    return this.raw.split("\n").map(function(line) {
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

        prevLine = line;
        return lineJson;
    });
}

Patch.prototype.getRaw = function() {
    return this.raw;
}

module.exports = Patch;
