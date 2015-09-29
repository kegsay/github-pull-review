"use strict";
var dispatcher = require("./dispatcher");

// Format: <action_name> : <action_data>
var actions = {
    view_pr: {
        repo_id: "string",
        request_id: "string"
    },
    token_update: {
        token: "string"
    },
    post_comment: {
        comment_id: "string",
        pr: "object", // PullRequest
        text: "string",
        in_reply_to: "object", // LineComment
        path: "string",
        pos: "number"
    },
    post_comment_response: {
        comment_id: "string",
        response: "string",
        is_error: "boolean"
    },
    pr_info: {
        pr: "object" // PullRequest
    },
    get_diffs: {
        repo: "string",
        id: "string",
        allow_cached: "boolean"
    },
    file_diffs: {
        files: "object" // actually a list of FileDiffs
    },
    line_comments: {
        comments: "object" // actually a list of LineComments
    }
}

function checkAction(name, data) {
    var schema = actions[name];
    if (!schema) {
        throw new Error(
            "Action '" + name + "' has not been added to actions.js"
        );
    }
    if (!data) {
        throw new Error(
            "Action '" + name + "' has no data property."
        );
    }
    Object.keys(schema).forEach(function(key) {
        if (typeof data[key] !== schema[key]) {
            throw new Error(
                "Action '" + name + "' was emitted but failed to pass " +
                "the schema. Expected '" + key + "' to be of type " +
                schema[key] + " but was actually of type " + typeof data[key]
            );
        }
    })
}

module.exports = {

    create: function(name, data) {
        checkAction(name, data);
        return {
            action: name,
            data: data
        };
    },

    ActionMixin: function(actionsToMonitor) {
        actionsToMonitor = actionsToMonitor || [];

        actionsToMonitor.forEach(function(a) {
            if (Object.keys(actions).indexOf(a) === -1) {
                throw new Error(
                    "ActionMixin: Told to monitor an unknown action '" + a +
                    "'. Did you add it to actions.js?"
                );
            }
        });

        return {
            componentDidMount: function() {
                this._dispatcherRef = dispatcher.register(this.onAction);
            },

            componentWillUnmount: function() {
                dispatcher.unregister(this._dispatcherRef);
            },

            onAction: function(payload) {
                if (actionsToMonitor.indexOf(payload.action) !== -1) {
                    var state = {};
                    state[payload.action] = payload.data;
                    this.setState(state);
                    if (this.onReceiveAction) {
                        this.onReceiveAction(payload.action, payload.data);
                    }
                }
            },

            getInitialState: function() {
                var initial = {};
                actionsToMonitor.forEach(function(a) {
                    initial[a] = {};
                });
                return initial;
            }
        };
    }
};
