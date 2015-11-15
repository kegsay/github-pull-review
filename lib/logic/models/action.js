/* @flow */
"use strict";
var React = require("react"); // eslint-disable-line

class Action {
    owner: string;
    comments: Array<any>; // FIXME
    done: boolean;

    constructor(owner: string) {
        this.owner = owner;
        this.comments = [];
        this.done = false;
    }

    addComment(comment: any) { // FIXME
        this.comments.push(comment);
    }

    addComments(comments: Array<any>) { // FIXME
        var self = this;
        comments.forEach(function(c) {
            self.addComment(c);
        });
    }

    isDone(): boolean {
        return this.done;
    }

    setDone(done: boolean) {
        this.done = done;
    }

    getHeadComment(): any { // FIXME
        return this.comments[0];
    }

    getComments(): Array<any> { // FIXME
        return this.comments;
    }

    /**
     * Convert a list of LineComments into a list of Actions.
     * @param {LineComment[]} cmts A list of line comments
     * @return {Action[]} A list of actions or an empty list
     */
    static fromLineComments(cmts: Array<any>): Array<Action> { // FIXME
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
    }
}

module.exports = Action;
