/* @flow */
"use strict";
var React = require("react"); // eslint-disable-line

class User {
    url: string;
    name: string;
    avatar: string;

    constructor(name: string, avatar: string, user_url: string) {
        this.url = user_url;
        this.name = name;
        this.avatar = avatar;
    }

    getAvatarUrl(): string {
        return this.avatar;
    }

    getUserLinkJsx(key: ?string): any {
        if (!this.url) {
            return <span>{this.name}</span>
        }
        return (
            <a href={this.url} target="_blank" key={key}>{this.name}</a>
        );
    }

    equals(other: User): boolean {
        if (!other) {
            return false;
        }
        return this.name === other.name;
    }
}

module.exports = User;
