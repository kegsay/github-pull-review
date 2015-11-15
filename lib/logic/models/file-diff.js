/* @flow */
"use strict";
var Patch = require("./patch");

class FileDiff {
    rawPatch: string;
    file: string;
    prevFile: ?string;
    status: string;
    link: ?string;
    additions: ?number;
    deletions: ?number;
    changes: ?number;
    patch: any; // FIXME

    /**
     * Construct a new File Diff.
     * @param {string} filePath The file path with diffs
     * @param {string} status Enum of {@link Diff.STATUS}
     * @param {string} patch The raw .patch
     * @param {Object=} lineCounts Summary line counts for this file.
     * @param {number} lineCounts.additions The number of lines added.
     * @param {number} lineCounts.deletions The number of lines removed.
     * @param {number} lineCounts.changes The number of lines changed.
     * @param {string=} prevFilename Previous file name, if any.
     * @param {string=} link The link to view the file at this commit.
     */
    constructor(filePath: string, status: string, patch: string, lineCounts: ?Object,
                prevFilename: ?string, link: ?string) {
        this.rawPatch = patch;
        this.file = filePath;
        this.prevFile = prevFilename;
        this.status = status;
        this.link = link;
        lineCounts = lineCounts || {
            additions: 0,
            deletions: 0,
            changes: 0
        };
        this.additions = lineCounts.additions;
        this.deletions = lineCounts.deletions;
        this.changes = lineCounts.changes;
        if (["added", "modified", "renamed", "removed"].indexOf(status) === -1) {
            throw new Error(
                "Bad FileDiff status: " + status
            );
        }
        if (patch) {
            this.patch = new Patch(patch);
        }
    }

    getFileExtension(): ?string {
        if (!this.file || this.file.indexOf(".") === -1) {
            return null;
        }
        var segments = this.file.split(".");
        return segments[segments.length-1];
    }

    getLink(): ?string {
        return this.link;
    }

    getPrevFilePath(): ?string {
        return this.prevFile;
    }

    getFilePath(): string {
        return this.file;
    }

    getAddCount(): ?number {
        return this.additions;
    }

    getRemoveCount(): ?number {
        return this.deletions;
    }

    getChangeCount(): ?number {
        return this.changes;
    }

    getStatus(): string {
        return this.status;
    }

    getFilePathString(): string {
        if (this.getPrevFilePath()) {
            return this.getPrevFilePath() + " → " + this.getFilePath();
        }
        else {
            return this.getFilePath();
        }
    }

    getStatusString(): string {
        // e.g. renamed => Renamed
        return this.status[0].toUpperCase() + this.status.slice(1);
    }

    getPatch(): any {
        return this.patch;
    }

    getRawPatch(): string {
        return this.rawPatch;
    }
}

module.exports = FileDiff;
