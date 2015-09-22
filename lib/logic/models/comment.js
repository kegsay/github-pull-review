"use strict";
var marked = require("marked");
marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
});

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
    // convert GFM to HTML
    return marked(this.body);
};

Comment.prototype.getUser = function() {
    return this.user;
};

Comment.prototype.getTimeAgo = function() {
    var seconds = Math.floor((new Date() - this.ts) / 1000);
    var interval = Math.floor(seconds / 31536000);
    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
};

module.exports = Comment;
