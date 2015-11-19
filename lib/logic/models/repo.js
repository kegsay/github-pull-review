/* @flow */
"use strict";

class Repo {
    cloneUrl: string;

    constructor(cloneUrl: string) {
        this.cloneUrl = cloneUrl;
    }

    getCloneUrl(): string {
        return this.cloneUrl;
    }
}

module.exports = Repo;
