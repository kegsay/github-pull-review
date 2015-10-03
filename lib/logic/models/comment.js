"use strict";
var utils = require("../../components/utils");


function Comment(id, user, body, ts, link) {
    this.id = id;
    this.ts = ts;
    this.body = body;
    this.user = user;
    this.link = link;
}

Comment.prototype.getId = function() {
    return this.id;
};

Comment.prototype.getLink = function() {
    return this.link;
};

Comment.prototype.getBody = function() {
    return this.body;
};

Comment.prototype.getHtmlBody = function() {
    if (!this.body) {
        return "<p><i>No comment provided.</i></p>";
    }
    return utils.markdownToHtml(this.body);
};

Comment.prototype.getUser = function() {
    return this.user;
};

Comment.prototype.getTimeAgo = function() {
    return utils.timeAgo(this.ts);
};

module.exports = Comment;
