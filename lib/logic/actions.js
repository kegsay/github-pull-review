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
    pr_info: {

    }
}

function checkAction(name, data) {
    var schema = actions[name];
    if (!schema) {
        throw new Error(
            "Action '" + name + "' has not been added to actions.js"
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
