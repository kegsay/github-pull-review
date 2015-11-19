/* @flow */
"use strict";
var React = require("react"); // eslint-disable-line
var utils = require("../../components/utils");

class Commit {
    sha: string;
    msg: string;
    ts: number;
    url: string;
    user: any; // FIXME

    constructor(sha: string, msg: string, ts: number, url: string, user: any) { // FIXME
        this.sha = sha;
        this.msg = msg;
        this.ts = ts;
        this.url = url;
        this.user = user;
    }

    getMessage(): string {
        return this.msg;
    }

    getTimeAgo(): string {
        return utils.timeAgo(this.ts);
    }


    getShaLinkJsx(): any { // FIXME JSX?
        return (
            <a href={this.url} target="_blank">{this.getShortSha()}</a>
        );
    }

    getTitle(): string {
        // the first line of the message
        return this.msg.split("\n")[0];
    }

    getHtmlDescription(): ?string {
        // the entire message except the first line
        var lines = this.msg.split("\n");
        lines.shift(); // kill the title
        if (lines.length === 0) {
            return null;
        }
        return utils.markdownToHtml(lines.join("\n"));
    }

    getAuthorLinkJsx(): any { // FIXME JSX?
        return this.user.getUserLinkJsx();
    }

    getShortSha(): string {
        return this.sha.substring(0, 7);
    }

    getSha(): string {
        return this.sha;
    }

    getUser(): any { // FIXME
        return this.user;
    }
}

module.exports = Commit;
