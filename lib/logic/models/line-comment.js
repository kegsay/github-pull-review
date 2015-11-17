/* @flow */
"use strict";

import Comment from "./comment";
import Patch from "./patch";

class LineComment {
    path: string;
    comment: Comment;
    pos: number;
    sha: string;
    patch: Patch;

    constructor(path: string, comment: Comment, pos: number, sha: string, patch: Patch) {
        this.path = path;
        this.comment = comment;
        this.sha = sha;
        this.patch = patch;
        this.position = pos;
    }

    matches(lineComment: LineComment): boolean {
        return (
            this.path === lineComment.path &&
            this.sha === lineComment.sha &&
            this.position === lineComment.position
        );
    }

    getPatch(): Patch {
        return this.patch;
    }

    isOnLine(line: Line, isLineUnified: boolean): boolean {
        var lineInPatch = this.patch.getLastLine(); // this.patch.getUnifiedData()[this.position];
        if (!lineInPatch) {
            return false;
        }
        if (isLineUnified) {
            return (
                lineInPatch.getOldFileLineNum() === line.getOldFileLineNum() &&
                lineInPatch.getNewFileLineNum() === line.getNewFileLineNum()
            );
        }
        else if (line.getOldFileLineNum()) {
            return lineInPatch.getOldFileLineNum() === line.getOldFileLineNum();
        }
        else if (line.getNewFileLineNum()) {
            return lineInPatch.getNewFileLineNum() === line.getNewFileLineNum();
        }
        return false;
    }

    getSha(): string {
        return this.sha;
    }

    getShortSha(): string {
        return this.sha.substring(0, 7);
    }

    getFilePath(): string {
        return this.path;
    }

    getComment(): Comment {
        return this.comment;
    }
}

module.exports = LineComment;
