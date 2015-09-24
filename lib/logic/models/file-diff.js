"use strict";

/**
 * Construct a new File Diff.
 * @param {string} filePath The file path with diffs
 * @param {string} status Enum of {@link Diff.STATUS}
 * @param {string} patch The raw .patch
 * @param {Object=} lineCounts Summary line counts for this file.
 * @param {number} lineCounts.additions The number of lines added.
 * @param {number} lineCounts.deletions The number of lines removed.
 * @param {number} lineCounts.changes The number of lines changed.
 */
function FileDiff(filePath, status, patch, lineCounts) {
    this.patch = patch;
    this.file = filePath;
    this.status = status;
    lineCounts = lineCounts || {
        additions: 0,
        deletions: 0,
        changes: 0
    };
    this.additions = lineCounts.additions;
    this.deletions = lineCounts.deletions;
    this.changes = lineCounts.changes;
    if (FileDiff.STATUSES.indexOf(status) === -1) {
        throw new Exception(
            "Bad FileDiff status: " + status
        );
    }
}

FileDiff.prototype.getFilePath = function() {
    return this.file;
};

FileDiff.prototype.getAddCount = function() {
    return this.additions;
};

FileDiff.prototype.getRemoveCount = function() {
    return this.deletions;
};

FileDiff.prototype.getChangeCount = function() {
    return this.changes;
};

FileDiff.prototype.getStatus = function() {
    return this.status;
};

FileDiff.prototype.getStatusString = function() {
    // e.g. renamed => Renamed
    return this.status[0].toUpperCase() + this.status.slice(1);
};

FileDiff.prototype.getRawPatch = function() {
    return this.patch;
}

FileDiff.STATUS = {
    ADDED: "added",
    RENAMED: "renamed",
    MODIFIED: "modified"
};
FileDiff.STATUSES = Object.keys(FileDiff.STATUS).map(function(k) {
    return FileDiff.STATUS[k];
});

module.exports = FileDiff;
