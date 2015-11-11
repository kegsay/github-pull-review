"use strict";
var dispatcher = require("./dispatcher");

class Trigger {
    name: string;
    data: Object;

    constructor(name) {
        this.name = name;
        this.data = {};
    }
}

class PullRequestTrigger extends Trigger {
    constructor(pr: any) { // type annotation FIXME
        super("pr_info");
        this.data.pr = pr;
    }
}

const TRIGGERS = {
    pr_info: PullRequestTrigger,
    get_diffs: "",
    file_diffs: "",
    line_comments: "",
    pr_list: ""
};


/*
// Format: <action_name> : <action_data>
var actions = {
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
    },
    pr_list: {
        myPulls: "object",
        assignedPulls: "object",
        error: "string"
    }
} */

module.exports = {

    PullRequestTrigger: PullRequestTrigger,

    create: function(name, data) {
        return {
            name: name,
            data: data
        };
    },

    TriggerMixin: function(triggersToMonitor) {
        triggersToMonitor = triggersToMonitor || [];

        triggersToMonitor.forEach(function(a) {
            if (Object.keys(TRIGGERS).indexOf(a) === -1) {
                throw new Error(
                    "TriggerMixin: Told to monitor an unknown trigger '" + a +
                    "'. Did you add it to triggers.js?"
                );
            }
        });

        return {
            componentDidMount: function() {
                this._dispatcherRef = dispatcher.register(this.onTrigger);
            },

            componentWillUnmount: function() {
                dispatcher.unregister(this._dispatcherRef);
            },

            onTrigger: function(trigger) {
                if (triggersToMonitor.indexOf(trigger.name) !== -1) {
                    if (this.onReceiveAction) {
                        this.onReceiveAction(trigger.name, trigger.data);
                    }
                    else {
                        // backwards compat
                        var state = {};
                        state[trigger.name] = trigger.data;
                        this.setState(state);
                    }
                }
            },

            getInitialState: function() {
                var initial = {};
                triggersToMonitor.forEach(function(a) {
                    initial[a] = {};
                });
                return initial;
            }
        };
    }
};
