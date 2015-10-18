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

Action.prototype.getHeadComment = function() {
    return this.comments[0];
};

Action.prototype.getComments = function() {
    return this.comments;
};

/**
 * Convert a list of LineComments into a list of Actions.
 * @param {LineComment[]} A list of line comments
 * @return {Action[]} A list of actions or an empty list
 */
Action.fromLineComments = function(comments) {
    return [];
};

module.exports = Action;
