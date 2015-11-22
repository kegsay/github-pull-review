/* @flow */
import dispatcher from "./dispatcher";
import PullRequest from "./models/pull-request";
import FileDiff from "./models/file-diff";
import LineComment from "./models/line-comment";

// TODO:
// - I wonder if we even needs ".name" for this. Would class comparisons be better/worse?
// - I also wonder if we need FileDiff/LineComments triggers, why not just PullRequestTrigger again?
//   Or should we be indicating updated keys somehow...
// - MergeErrorTrigger feels wrong, I wonder if it should be merged into a MergeTrigger with an
//   error field.
// - Should these triggers be separate files?
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


class FileDiffsTrigger extends Trigger {
    static TYPE: string;
    files: Array<FileDiff>;

    constructor(files: Array<FileDiff>) {
        super(FileDiffTrigger.TYPE);
        this.files = files;
    }
}
FileDiffsTrigger.TYPE = "file_diffs";


class LineCommentsTrigger extends Trigger {
    static TYPE: string;
    comments: Array<LineComment>;

    constructor(comments: Array<LineComment>) {
        super(LineCommentsTrigger.TYPE);
        this.comments = comments;
    }
}
LineCommentsTrigger.TYPE = "line_comments";


class PullRequestListTrigger extends Trigger {
    static TYPE: string;
    myPulls: Array<PullRequest>;
    assignedPulls: Array<PullRequest>;
    error: ?string;

    constructor(myPulls: Array<PullRequest>, assignedPulls: Array<PullRequest>, error: ?string) {
        super(PullRequestListTrigger.TYPE);
        this.assignedPulls = assignedPulls;
        this.myPulls = myPulls;
        this.error = error;
    }
}
PullRequestListTrigger.TYPE = "pr_list";


class MergeErrorTrigger extends Trigger {
    static TYPE: string;
    error: Object;

    constructor(error: Object) {
        super(MergeErrorTrigger.TYPE);
        this.error = error;
    }
}
MergeErrorTrigger.TYPE = "merge_error";

const TRIGGERS = {
    // $FlowIssue
    [PullRequestTrigger.TYPE]: PullRequestTrigger,
    // $FlowIssue
    [FileDiffsTrigger.TYPE]: FileDiffsTrigger,
    // $FlowIssue
    [LineCommentsTrigger.TYPE]: LineCommentsTrigger,
    // $FlowIssue
    [PullRequestListTrigger.TYPE]: PullRequestListTrigger,
    // $FlowIssue
    [MergeErrorTrigger.TYPE]: MergeErrorTrigger
};

module.exports = {

    PullRequestTrigger: PullRequestTrigger,
    FileDiffsTrigger: FileDiffsTrigger,
    LineCommentsTrigger: LineCommentsTrigger,
    PullRequestListTrigger: PullRequestListTrigger,
    MergeErrorTrigger: MergeErrorTrigger,

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
