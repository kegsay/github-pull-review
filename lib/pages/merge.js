import {PullRequestTrigger, MergeErrorTrigger} from "../logic/triggers";

var React = require("react");
var CommitListView = require("../components/commit-list-view");
var TriggerMixin = require("../logic/triggers").TriggerMixin([
    MergeErrorTrigger, PullRequestTrigger,
]);

const SQUASH_REWRITING_HISTORY = "Squash rewriting history";
const SQUASH_MERGE = "Squash leaving PR closed not merged";
const MERGE_WITHOUT_SQUASH = "Merge without squashing";

module.exports = React.createClass({displayName: 'MergePage',
    mixins: [TriggerMixin],

    componentDidMount: function() {
        this.setTrigger(
            new PullRequestTrigger(this.props.controller.getPullRequest())
        );
    },

    getInitialState: function() {
        // TODO: Also do this when re-selecting the tab
        return {
            flowStage: "selectMergeKind",
            mergeKind: null,
            commitMessage: null
        };
    },

    promptForCommitMessage: function(event) {
        var pr = this.getTrigger(PullRequestTrigger).pr;

        var commitMessage = pr.getTitle();
        if (pr.getBody()) {
            commitMessage += `\n\n${pr.getBody()}`;
        }

        if (event.target.textContent === SQUASH_MERGE) {
            commitMessage += `\n\nSquash-merged from pull request #${pr.getId()}`;
        }
        else if (event.target.textContent === MERGE_WITHOUT_SQUASH) {
            commitMessage = `Merge pull request # ${pr.getId()} from ` +
                `${pr.getSource().getUser().name}/${pr.getSource().getRef()}`;
        }

        this.setState({
            flowStage: "wantCommitMessage",
            mergeKind: event.target.textContent,
            commitMessage: commitMessage
        });
    },

    doMerge: function() {
        this.setState({flowStage: "merging"});
        var pr = this.getTrigger(PullRequestTrigger).pr;
        if (this.state.mergeKind === SQUASH_REWRITING_HISTORY) {
            this.props.controller.squashMergeWithRewrite(pr, this.state.commitMessage);
        }
        else if (this.state.mergeKind === SQUASH_MERGE) {
            this.props.controller.squashMergeWithoutRewrite(pr, this.state.commitMessage);
        }
        else if (this.state.mergeKind === MERGE_WITHOUT_SQUASH) {
            this.props.controller.merge(pr, this.state.commitMessage);
        }
    },

    gotMergeError: function() {
        var error = this.getTrigger(MergeErrorTrigger).error;
        return error && Object.keys(error).length !== 0;
    },

    onChangeText: function(event) {
        this.setState({commitMessage: event.target.value});
    },

    render: function() {
        var pr = this.getTrigger(PullRequestTrigger).pr;
        if (!pr || Object.keys(pr).length === 0) {
            return <div className="MergeOptionContainer">Loading pull request...</div>;
        }
        if (pr.getState() === "merged") {
            return (
                <div className="MergeOptionContainer">PR has been merged</div>
            );
        }
        var mergeable = pr.getMergeable();
        if (mergeable === null) {
            return (
                <div className="MergeOptionContainer">
                    Mergeable state unknown; check again soon
                </div>
            );
        }
        if (!mergeable) {
            return (
                <div className="MergeOptionContainer">
                PR is not mergeable;
                try merging {pr.getDest().getRef()} out into {pr.getSource().getRef()}.
                </div>
            );
        }
        if (this.state.flowStage === "selectMergeKind") {
            return (
                <div className="MergeOptionContainer">
                    <span onClick={this.promptForCommitMessage} className="link">
                        {SQUASH_REWRITING_HISTORY}
                    </span>
                    <br />
                    <span onClick={this.promptForCommitMessage} className="link">
                        {SQUASH_MERGE}
                    </span>
                    <br />
                    <span onClick={this.promptForCommitMessage} className="link">
                        {MERGE_WITHOUT_SQUASH}
                    </span>
                    <br /><br />
                    Commits:
                    <CommitListView
                        commits={pr.getCommits()} repo={pr.getRepo()} req={pr.getId()} />
                </div>
            );
        }
        else if (this.state.flowStage === "wantCommitMessage" ||
                this.state.flowStage === "merging") {
            var mergeState = "mergable";
            var mergeText = "Merge";
            if (this.gotMergeError()) {
                mergeState = "error";
                mergeText = "Error merging";
            }
            else if (this.state.flowStage === "merging") {
                mergeState = "merging";
                mergeText = "Merging...";
            }
            return (
                <div>
                    <div className="MergeOptionContainer">
                        <h2>{this.state.mergeKind}</h2>
                        Commit message:
                        <br />
                        <textarea className="CommentBox_textarea"
                            onChange={this.onChangeText}
                            value={this.state.commitMessage}
                            disabled={this.state.flowStage === "merging"}/>
                        <br />
                        <span onClick={this.doMerge} className={`MergeButton_${mergeState}`}>
                            {mergeText}
                        </span>
                    </div>
                    <br />
                    Commits:
                    <CommitListView
                        commits={pr.getCommits()} repo={pr.getRepo()} req={pr.getId()} />
                </div>
            );
        }
    }
});
