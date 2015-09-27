"use strict";

function LineComment(path, comment, pos, sha, patch) {
    this.path = path;
    this.comment = comment;
    this.sha = sha;
    this.patch = patch;
    this.position = pos;
}

LineComment.prototype.isOnLine = function(line, isLineUnified) {
    var lineInPatch = this.patch.getUnifiedData()[this.position];
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
};

LineComment.prototype.getSha = function() {
    return this.sha;
};

LineComment.prototype.getShortSha = function() {
    return this.sha.substring(0, 7);
};

LineComment.prototype.getFilePath = function() {
    return this.path;
};

LineComment.prototype.getComment = function() {
    return this.comment;
};

module.exports = LineComment;
