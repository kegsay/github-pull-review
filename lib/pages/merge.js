var React = require("react");

var ActionMixin = require("../logic/actions").ActionMixin([
    "pr_info"
]);

module.exports = React.createClass({displayName: 'MergePage',
    mixins: [ActionMixin],

    componentDidMount: function() {
        this.setState({
            pr_info: {
                pr: this.props.controller.getPullRequest()
            }
        });
    },

    squashMergeWithRewrite: function(event) {
        var pr = this.state.pr_info.pr;
        var commitMessage = pr.getTitle();
        if (pr.getBody()) {
            commitMessage += "\n\n" + pr.getBody();
        }
        this.props.controller.squashMergeWithRewrite(pr, commitMessage);
    },

    squashMergeWithoutRewrite: function(event) {
        var pr = this.state.pr_info.pr;
        var commitMessage = pr.getTitle();
        if (pr.getBody()) {
            commitMessage += "\n\n" + pr.getBody();
        }
        commitMessage += "\n\nSquash-merged from pull request #" + pr.getTitle() +
            " from " + pr.getSource().getUser().name + "/" + pr.getSource().getRef();
        this.props.controller.squashMergeWithoutRewrite(pr, commitMessage);
    },

    merge: function(event) {
        var pr = this.state.pr_info.pr;
        var commitMessage = "Merge pull request #" + pr.getId() + " from " +
            pr.getSource().getUser().name + "/" + pr.getSource().getRef();
        if (pr.getTitle()) {
            commitMessage += "\n\n" + pr.getTitle();
        }
        this.props.controller.merge(pr, commitMessage);
    },

    render: function() {
        var pr = this.state.pr_info.pr;
        if (!pr || Object.keys(pr).length === 0) {
            return <div>Loading pull request...</div>;
        }
        if (pr.getState() === "merged") {
            return (
                <div>Already merged</div>
            );
        }
        var mergeable = pr.getMergeable();
        if (mergeable === null) {
            return (
                <div>Mergeable state unknown; check again soon</div>
            );
        }
        if (!mergeable) {
            return (
                <div>
                PR is not mergeable;
                try merging {pr.getDest().getRef()} out into {pr.getSource().getRef()}.
                </div>
            );
        }
        return (
            <div>
                <a onClick={this.squashMergeWithRewrite}>Squash rewriting history</a><br />
                <a onClick={this.squashMergeWithoutRewrite}>
                    Squash leaving PR closed not merged
                </a><br />
                <a onClick={this.merge}>Merge without squashing</a>
            </div>
        );
    }
});
