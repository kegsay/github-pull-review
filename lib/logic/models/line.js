/* @flow */
"use strict";

class Line {
    static TYPE_ADD: string;
    static TYPE_DEL: string;
    static TYPE_NOP: string;
    static TYPE_HUNK: string;
    static TYPE_BLANK: string;
    static TYPES: Array<string>;
    type: string;
    raw: string;
    from: number;
    to: number;
    _oldFileNum: ?number;
    _newFileNum: ?number;


    constructor(type: string, raw: string) {
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

    matches(line: Line): boolean {
        if (!line) {
            return false;
        }
        return this.raw === line.raw && this._oldFileNum === line._oldFileNum &&
            this._newFileNum == line._newFileNum;
    }

    setOldFileLineNum(num: number) {
        this._oldFileNum = num;
    }

    setNewFileLineNum(num: number) {
        this._newFileNum = num;
    }

    setFromChar(num: number) {
        this.from = num;
    }

    setToChar(num: number) {
        this.to = num;
    }

    setHighlightRange(from: number, to: number) {
        if (from < 0 || to > this.raw.length) { // highlighted section can be EOL hence > and not >=
            throw new Error(
                "setHighlightRange(" + from + "," + to + ") out of bounds on raw string of "+
                "length " + this.raw.length +": " + this.raw
            );
        }
        this.from = from;
        this.to = to;
    }

    /**
     * @return {String[]} corresponding to [pre-highlight, highlighted section, post-highlight]
     */
    getHighlightedSections(): Array<string> {
        return [
            this.raw.slice(0, this.from),
            this.raw.slice(this.from, this.to),
            this.raw.slice(this.to)
        ];
    }

    hasHighlightedSection(): boolean {
        return this.from >= 0 && this.to >= 0;
    }

    getOldFileLineNum(): ?number {
        return this._oldFileNum;
    }

    getNewFileLineNum(): ?number {
        return this._newFileNum;
    }

    getRawLine(): string {
        return this.raw;
    }

    getType(): string {
        return this.type;
    }
}

Line.TYPE_ADD = "add"; // Line has been added (green background)
Line.TYPE_DEL = "del"; // Line has been removed (red background)
Line.TYPE_NOP = "nop"; // Line has text but no diff between versions
Line.TYPE_HUNK = "hunk"; // Line is a hunk e.g. @@ -1,3 +5,6 @@
Line.TYPE_BLANK = "blank"; // Line has no text and isn't part of the
                           // file (placeholder for side by side diffs)
Line.TYPES = [
    Line.TYPE_BLANK, Line.TYPE_HUNK, Line.TYPE_NOP, Line.TYPE_DEL, Line.TYPE_ADD
];

module.exports = Line;
