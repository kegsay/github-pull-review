/* @flow */
"use strict";

class Ref {

    // instance prop types
    repo: string;
    user: any; // FIXME
    label: string;
    sha: string;
    ref: string;

    constructor(repo: string, user: any, label: string, sha: string, ref: string) {
        this.repo = repo;
        this.user = user;
        this.label = label;
        this.sha = sha;
        this.ref = ref;
    }

    getRepo(): string {
        return this.repo;
    }

    getUser(): any {
        return this.user;
    }

    getLabel(): string {
        return this.label;
    }

    getSha(): string {
        return this.sha;
    }

    getRef(): string {
        return this.ref;
    }

}

module.exports = Ref;

