"use strict";

function PullRequest(repo, id) {
    this.repo = repo;
    this.id = id;
    this.link = null;
    this.title = null;
    this.state = null;
    this.src = null;
    this.dest = null;
    this.owner = null;
    this.merger = null;
    this.baseSha = null;
    this.commits = [];
    this.comments = [];
}

PullRequest.prototype.setState = function(state) {
    if (["merged", "open", "closed"].indexOf(state) === -1) {
        throw new Error("setState: bad state => " + state);
    }
    this.state = state;
};

PullRequest.prototype.setLink = function(link) {
    this.link = link;
};

PullRequest.prototype.setTitle = function(title) {
    this.title = title;
};

PullRequest.prototype.setBaseSha = function(sha) {
    this.baseSha = sha;
};

PullRequest.prototype.setSourceDestRepos = function(src, dest) {
    this.src = src;
    this.dest = dest;
};

PullRequest.prototype.setOwner = function(user) {
    this.owner = user;
};

PullRequest.prototype.setMerger = function(merger) {
    this.merger = merger;
};

PullRequest.prototype.getRepo = function() {
    return this.repo;
};

PullRequest.prototype.getId = function() {
    return this.id;
};

PullRequest.prototype.getTitle = function() {
    return this.title;
};

PullRequest.prototype.getLink = function() {
    return this.link;
};

PullRequest.prototype.getState = function() {
    return this.state;
};

PullRequest.prototype.getPrettyState = function() {
    if (!this.state) { return null; }
    return this.state[0].toUpperCase() + this.state.substring(1);
};

PullRequest.prototype.getSourceRepo = function() {
    return this.src;
};

PullRequest.prototype.getDestRepo = function() {
    return this.dest;
};

PullRequest.prototype.getOwner = function() {
    return this.owner;
};

PullRequest.prototype.getMerger = function() {
    return this.merger;
};

PullRequest.prototype.getCommits = function() {
    return this.commits;
};

PullRequest.prototype.getComments = function() {
    return this.comments;
};

PullRequest.prototype.setComments = function(comments) {
    this.comments = comments;
};

PullRequest.prototype.setCommits = function(commits) {
    this.commits = commits;
};

PullRequest.prototype.getBaseSha = function() {
    return this.baseSha;
};

PullRequest.prototype.getHeadSha = function() {
    var commit = this.commits[this.commits.length -1];
    if (!commit) {
        return null;
    }
    return commit.getSha();
};

module.exports = PullRequest;
