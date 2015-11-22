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
        super(FileDiffsTrigger.TYPE);
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

    /**
     * Create a trigger mixin which handles a lot of boilerplate for creating triggers.
     * @param {TriggerClass[]} triggersToMonitor A list of trigger classes to monitor.
     * @param {boolean} dontStoreState True to NOT persist the trigger received
     * in this.state.triggers[Trigger.TYPE]
     */
    TriggerMixin: function(triggersToMonitor: Array<Class<Trigger>>, dontStoreState: boolean): any {
        triggersToMonitor = triggersToMonitor || [];

        triggersToMonitor.forEach(function(Cls) {
            if (Object.keys(TRIGGERS).indexOf(Cls.TYPE) === -1) {
                throw new Error(
                    "TriggerMixin: Told to monitor an unknown trigger '" + a +
                    "'. Did you add it to triggers.js?"
                );
            }
        });

        return {
            componentWillMount: function() {
                this._dispatcherRef = dispatcher.register(this._onTrigger);
            },

            componentWillUnmount: function() {
                dispatcher.unregister(this._dispatcherRef);
            },

            _onTrigger: function(trigger) {
                if (!dontStoreState) {
                    this.setTrigger(trigger);
                }

                // call a user supplied callback if given
                if (this.onTrigger) {
                    this.onTrigger(trigger);
                }
            },

            getInitialState: function() {
                var initial = {
                    triggers: {}
                };
                triggersToMonitor.forEach(function(Cls) {
                    initial.triggers[Cls.TYPE] = {};
                });
                return initial;
            },

            getTrigger: function(TriggerClass) {
                return this.state.triggers[TriggerClass.TYPE];
            },

            setTrigger: function(trigger) {
                var existingTriggers = this.state.triggers;
                existingTriggers[trigger.name] = trigger;
                this.setState({
                    triggers: existingTriggers
                });
            }
        };
    }
};
