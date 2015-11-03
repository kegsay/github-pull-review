"use strict";
var React = require("react");

function Action(owner) {
    this.owner = owner;
    this.comments = [];
    this.done = false;
}

Action.prototype.addComment = function(comment) {
    this.comments.push(comment);
};

Action.prototype.addComments = function(comments) {
    var self = this;
    comments.forEach(function(c) {
        self.addComment(c);
    });
};

Action.prototype.isDone = function() {
    return this.done;
};

Action.prototype.setDone = function(done) {
    this.done = done;
};

Action.prototype.getHeadComment = function() {
    return this.comments[0];
};

Action.prototype.getComments = function() {
    return this.comments;
};

/**
 * Convert a list of LineComments into a list of Actions.
 * @param {LineComment[]} cmts A list of line comments
 * @return {Action[]} A list of actions or an empty list
 */
Action.fromLineComments = function(cmts) {
    // Create a new Action for each set of line comments on the same line.
    var actions = [];
    var comments = cmts;
    for (var i = 0; i < comments.length; i++) {
        var currentComment = comments[i];
        var relatedComments = [];
        var lastComment = null;
        for (var j = i + 1; j < comments.length; j++) {
            var testComment = comments[j];
            if (currentComment.matches(testComment)) {
                comments.splice(j--, 1); // remove the matching comment
                relatedComments.push(testComment);
                lastComment = testComment;
            }
        }
        var action = new Action(currentComment.getComment().getUser());
        action.addComment(currentComment);
        action.addComments(relatedComments);
        if (lastComment) {
            // see if we can mark it as done
            var body = lastComment.getComment().getBody();
            if (/^([^\n]*\n)*done\b/i.test(body) || /^([^\n]*\n)*fixed\b/i.test(body)) {
                action.setDone(true);
            }
        }
        actions.push(action);
    }
    console.log("Action.fromLineComments => %s => %s actions", cmts.length, actions.length);
    return actions;
};

module.exports = Action;
