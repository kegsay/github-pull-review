/* @flow */
"use strict";
var utils = require("../../components/utils");

class Comment {
    id: string;
    ts: number;
    body: string;
    user: any; // FIXME
    link: string;

    constructor(id: string, user: any, body: string, ts: number, link: string) { // FIXME
        this.id = id;
        this.ts = ts;
        this.body = body;
        this.user = user;
        this.link = link;
    }

    getId(): string {
        return this.id;
    }

    getLink(): string {
        return this.link;
    }

    getBody(): string {
        return this.body;
    }

    getHtmlBody(): string {
        if (!this.body) {
            return "<p><i>No comment provided.</i></p>";
        }
        return utils.markdownToHtml(this.body);
    }

    getUser(): any { // FIXME
        return this.user;
    }

    getTimeAgo(): string {
        return utils.timeAgo(this.ts);
    }
}

module.exports = Comment;
