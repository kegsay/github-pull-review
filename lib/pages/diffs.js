var React = require("react");
var ActionMixin = require("../logic/actions").ActionMixin([
    "pr_info", "file_diffs", "line_comments"
]);
var FileDiffListView = require("../components/file-diff-list-view");

module.exports = React.createClass({displayName: 'DiffsPage',
    mixins: [ActionMixin],

    // navigating first mount
    componentDidMount: function() {
        this._loadDiffs();
    },

    // navigating once mounted
    componentWillReceiveProps: function(newProps) {
        this._loadDiffs();
    },

    componentDidUpdate: function() {
        this._loadDiffs();
    },

    _loadDiffs: function() {
        // make sure we have a valid PR
        if (this.state.pr_info.pr !== this.props.controller.getPullRequest()) {
            this.setState({
                pr_info: {
                    pr: this.props.controller.getPullRequest()
                }
            });
            return;
        }
        if (!this.state.pr_info.pr) {
            return;
        }

        // load the diffs if we need to.
        this.props.controller._refreshDiffs(this.state.pr_info.pr);
    },

    onSubmitReplyToComment: function(path, lineComment, text) {
        return this.props.controller.postReplyLineComment(this.state.pr_info.pr, path, lineComment, text);
    },

    onSubmitLineComment: function(path, pos, text) {
        return this.props.controller.postLineComment(this.state.pr_info.pr, path, pos, text);
    },

    render: function() {
        var pr = this.state.pr_info.pr;
        if (!pr) {
            return <div>Loading pull request...</div>;
        }
        var fileDiffs = this.state.file_diffs ? this.state.file_diffs.files : [];
        var lineComments = this.state.line_comments ? this.state.line_comments.comments : [];
        return (
            <FileDiffListView diffs={fileDiffs} comments={lineComments} pr={pr}
                onReplyToComment={this.onSubmitReplyToComment}
                onLineComment={this.onSubmitLineComment} />
        );
    }
});
