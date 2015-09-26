"use strict";

function Line(type, raw) {
    this.type = type;
    this.raw = raw;
    this.from = -1;
    this.to = -1;
    this._oldFileNum = undefined;
    this._newFileNum = undefined;
    if (Line.TYPES.indexOf(type) === -1) {
        throw new Error("Bad Line type '" + type+"' on line " + raw);
    }
}

Line.prototype.setOldFileLineNum = function(num) {
    this._oldFileNum = num;
};

Line.prototype.setNewFileLineNum = function(num) {
    this._newFileNum = num;
};

Line.prototype.setFromChar = function(num) {
    this.from = num;
};

Line.prototype.setToChar = function(num) {
    this.to = num;
};

Line.prototype.setHighlightRange = function(from, to) {
    if (from < 0 || to >= this.raw.length) {
        throw new Error(
            "setHighlightRange(%s,%s) out of bounds on raw string '%s'",
            from, to, this.raw
        );
    }
    this.from = from;
    this.to = to;
}

Line.prototype.hasHighlightedSection = function() {
    return this.from >= 0 && this.to >= 0;
};

Line.prototype.getOldFileLineNum = function() {
    return this._oldFileNum;
};

Line.prototype.getNewFileLineNum = function() {
    return this._newFileNum;
};

Line.prototype.getRawLine = function() {
    return this.raw;
};

Line.prototype.getType = function() {
    return this.type;
};

Line.TYPE_ADD = "add"; // Line has been added (green background)
Line.TYPE_DEL = "del"; // Line has been removed (red background)
Line.TYPE_NOP = "nop"; // Line has text but no diff between versions
Line.TYPE_HUNK = "hunk"; // Line is a hunk e.g. @@ -1,3 +5,6 @@
Line.TYPE_BLANK = "blank"; // Line has no text and isn't part of the file (placeholder for side by side diffs)
Line.TYPES = [
    Line.TYPE_BLANK, Line.TYPE_HUNK, Line.TYPE_NOP, Line.TYPE_DEL, Line.TYPE_ADD
];

module.exports = Line;
