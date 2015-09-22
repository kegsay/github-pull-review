"use strict";
var utils = require("../../components/utils");


function Comment(id, user, body, ts) {
    this.id = id;
    this.ts = ts;
    this.body = body;
    this.user = user;
}

Comment.prototype.getBody = function() {
    return this.body;
};

Comment.prototype.getHtmlBody = function() {
    return utils.markdownToHtml(this.body);
};

Comment.prototype.getUser = function() {
    return this.user;
};

Comment.prototype.getTimeAgo = function() {
    return utils.timeAgo(this.ts);
};

module.exports = Comment;
