/* @flow */
import dispatcher from "./dispatcher";

class Trigger {
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}


class PullRequestTrigger extends Trigger {
    static TYPE: string;
    pr: PullRequest;

    constructor(pr: PullRequest) {
        super(PullRequestTrigger.TYPE);
        this.pr = pr;
    }
}
PullRequestTrigger.TYPE = "pr_info";



const TRIGGERS = {
    [PullRequestTrigger.TYPE]: PullRequestTrigger,
    file_diffs: "",
    line_comments: "",
    pr_list: ""
};


/*
// Format: <action_name> : <action_data>
var actions = {
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

    create: function(name: string, data: any): Object {
        return {
            name: name,
            data: data
        };
    },

    TriggerMixin: function(triggersToMonitor: Array<string>): any {
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
                    var data;
                    // ming for now until everything uses new-style triggers
                    if (trigger instanceof PullRequestTrigger) {
                        data = trigger;
                    }
                    else {
                        data = trigger.data;
                    }

                    if (this.onReceiveAction) {
                        this.onReceiveAction(trigger.name, data);
                    }
                    else {
                        // backwards compat
                        var state = {};
                        state[trigger.name] = data;
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
