"use strict";
var Actions = require("../models/action");

function PullRequest(repo, id) {
    this.repo = repo;
    this.id = id;
    this.link = null;
    this.title = null;
    this.body = null;
    this.state = null;
    this.src = null;
    this.dest = null;
    this.owner = null;
    this.assignee = null;
    this.merger = null;
    this.mergeable = null;
    this.commits = [];
    this.comments = [];
    this.lineComments = [];
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

PullRequest.prototype.setBody = function(body) {
    this.body = body;
};

PullRequest.prototype.setSource = function(src) {
    this.src = src;
};

PullRequest.prototype.setDest = function(dest) {
    this.dest = dest;
};

PullRequest.prototype.setOwner = function(user) {
    this.owner = user;
};

PullRequest.prototype.setAssignee = function(assignee) {
    this.assignee = assignee;
};

PullRequest.prototype.setMerger = function(merger) {
    this.merger = merger;
};

PullRequest.prototype.setMergeable = function(mergeable) {
    this.mergeable = mergeable;
};

PullRequest.prototype.setLineComments = function(lineComments) {
    this.lineComments = lineComments;
    this.actions = Actions.fromLineComments(lineComments);
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

PullRequest.prototype.getBody = function() {
    return this.body;
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

PullRequest.prototype.getSource = function() {
    return this.src;
};

PullRequest.prototype.getDest = function() {
    return this.dest;
};

PullRequest.prototype.getOwner = function() {
    return this.owner;
};

PullRequest.prototype.getAssignee = function() {
    return this.assignee;
};

PullRequest.prototype.getMerger = function() {
    return this.merger;
};

PullRequest.prototype.getMergeable = function() {
    return this.mergeable;
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

PullRequest.prototype.getActions = function() {
    return this.actions;
};

PullRequest.prototype.getDoneActions = function() {
    return this.getActions().filter(function(a) {
        return a.isDone();
    });
};

PullRequest.prototype.getActionsToDo = function() {
    return this.getActions().filter(function(a) {
        return !a.isDone();
    });
};

PullRequest.prototype.isLGTM = function() {
    var lastComment = this.getLastComment();
    if (!lastComment) {
        return false;
    }
    return lastComment.getBody().indexOf("LGTM") >= 0;
};

PullRequest.prototype.getLastComment = function() {
    if (this.getComments().length === 0) {
        return null;
    }
    return this.getComments()[this.getComments().length - 1];
};

PullRequest.prototype.getLastCommenter = function() {
    var lastComment = this.getLastComment();
    if (!lastComment) {
        return null;
    }
    return lastComment.getUser();
};

PullRequest.prototype.getLineComments = function() {
    return this.lineComments;
};

module.exports = PullRequest;
