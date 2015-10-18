"use strict";
var React = require("react");

function Action(owner) {
    this.owner = owner;
    this.comments = [];
    this.done = false;
}

Action.prototype.addComment = function(comment) {
    return this.comments.push(comment);
};

Action.prototype.isDone = function() {
    return this.done;
};

Action.fromComments = function(comments) {
    return [];
};

module.exports = Action;
