var React = require("react");
var CommitListView = require("../components/commit-list-view");

var TriggerMixin = require("../logic/triggers").TriggerMixin([
    "merge_error", "pr_info",
]);

const squashRewritingHistory = "Squash rewriting history";
const squashMerge = "Squash leaving PR closed not merged";
const mergeWithoutSquash = "Merge without squashing";

module.exports = React.createClass({displayName: 'MergePage',
    mixins: [TriggerMixin],

    componentDidMount: function() {
        this.setState({
            pr_info: {
                pr: this.props.controller.getPullRequest()
            }
        });
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
        var pr = this.state.pr_info.pr;

        var commitMessage = pr.getTitle();
        if (pr.getBody()) {
            commitMessage += "\n\n" + pr.getBody();
        }

        if (event.target.textContent === squashMerge) {
            commitMessage += "\n\nSquash-merged from pull request #" + pr.getId();
        }
        else if (event.target.textContent === mergeWithoutSquash) {
            commitMessage = "Merge pull request #" + pr.getId() + " from " +
                pr.getSource().getUser().name + "/" + pr.getSource().getRef();
        }

        this.setState({
            flowStage: "wantCommitMessage",
            mergeKind: event.target.textContent,
            commitMessage: commitMessage
        });
    },

    doMerge: function() {
        this.setState({flowStage: "merging"});
        var pr = this.state.pr_info.pr;
        if (this.state.mergeKind === squashRewritingHistory) {
            this.props.controller.squashMergeWithRewrite(pr, this.state.commitMessage);
        }
        else if (this.state.mergeKind === squashMerge) {
            this.props.controller.squashMergeWithoutRewrite(pr, this.state.commitMessage);
        }
        else if (this.state.mergeKind === mergeWithoutSquash) {
            this.props.controller.merge(pr, this.state.commitMessage);
        }
    },

    gotMergeError: function() {
        return Object.keys(this.state.merge_error).length !== 0;
    },

    onChangeText: function(event) {
        this.setState({commitMessage: event.target.value});
    },

    render: function() {
        var pr = this.state.pr_info.pr;
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
                <div className="MergeOptionContainer">Mergeable state unknown; check again soon</div>
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
                    <span onClick={this.promptForCommitMessage} className="link">{squashRewritingHistory}</span>
                    <br />
                    <span onClick={this.promptForCommitMessage} className="link">{squashMerge}</span>
                    <br />
                    <span onClick={this.promptForCommitMessage} className="link">{mergeWithoutSquash}</span>
                    <br /><br />
                    Commits:
                    <CommitListView commits={pr.getCommits()} repo={pr.getRepo()} req={pr.getId()} />
                </div>
            );
        }
        else if (this.state.flowStage === "wantCommitMessage" || this.state.flowStage === "merging") {
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
                        <span onClick={this.doMerge} className={`MergeButton_${mergeState}`}>{mergeText}</span>
                    </div>
                    <br />
                    Commits:
                    <CommitListView commits={pr.getCommits()} repo={pr.getRepo()} req={pr.getId()} />
                </div>
            );
        }
    }
});
