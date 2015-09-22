"use strict";
var utils = require("../../components/utils");

function Commit(sha, msg, ts, url, user) {
    this.sha = sha;
    this.msg = msg;
    this.ts = ts;
    this.url = url;
    this.user = user;
}

Commit.prototype.getMessage = function() {
    return this.msg;
};

Commit.prototype.getTimeAgo = function() {
    return utils.timeAgo(this.ts);
};

Commit.prototype.getShaLinkJsx = function() {
    return (
        <a href={this.url} target="_blank">{this.getShortSha()}</a>
    );
}

Commit.prototype.getTitle = function() {
    // the first line of the message
    return this.msg.split("\n")[0];
};

Commit.prototype.getHtmlDescription = function() {
    // the entire message except the first line
    var lines = this.msg.split("\n");
    lines.shift(); // kill the title
    if (lines.length === 0) {
        return null;
    }
    return utils.markdownToHtml(lines.join("\n"));
};

Commit.prototype.getAuthorLinkJsx = function() {
    return this.user.getUserLinkJsx();
};

Commit.prototype.getShortSha = function() {
    return this.sha.substring(0, 7);
};

Commit.prototype.getSha = function() {
    return this.sha;
};

Commit.prototype.getUser = function() {
    return this.user;
};

module.exports = Commit;
