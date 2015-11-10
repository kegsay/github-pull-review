"use strict";

function Repo(cloneUrl) {
    this.cloneUrl = cloneUrl;
}

Repo.prototype.getCloneUrl = function() {
    return this.cloneUrl;
};

module.exports = Repo;
