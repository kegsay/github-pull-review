"use strict";
function Ref(repo, user, label, sha, ref) {
    this.repo = repo;
    this.user = user;
    this.label = label;
    this.sha = sha;
    this.ref = ref;
}

Ref.prototype.getRepo = function() {
    return this.repo;
};

Ref.prototype.getUser = function() {
    return this.user;
};

Ref.prototype.getLabel = function() {
    return this.label;
};

Ref.prototype.getSha = function() {
    return this.sha;
};

Ref.prototype.getRef = function() {
    return this.ref;
};

module.exports = Ref;
