"use strict";

function LineComment(path, comment, sha, patch) {
    this.path = path;
    this.comment = comment;
    this.sha = sha;
    this.patch = patch;
};

LineComment.prototype.getFilePath = function() {
    return this.path;
};

LineComment.prototype.getComment = function() {
    return this.comment;
};

module.exports = LineComment;
