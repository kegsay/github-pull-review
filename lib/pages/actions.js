var React = require("react");
var dispatcher = require("../logic/dispatcher");
var actions = require("../logic/actions");
var ActionMixin = require("../logic/actions").ActionMixin([
    "pr_info", "file_diffs", "line_comments"
]);

module.exports = React.createClass({displayName: 'ActionsPage',
    mixins: [ActionMixin],

    // navigating first mount
    componentDidMount: function() {
        this._loadDiffs(this.props);
    },

    // navigating once mounted
    componentWillReceiveProps: function(newProps) {
        this._loadDiffs(newProps);
    },

    _loadDiffs: function(props) {
        // set the pr if we already know it.
        var pullRequest = this.props.controller.getPullRequest();
        if (pullRequest) {
            this.setState({
                pr_info: {
                    pr: pullRequest
                }
            });
        }
        var ownerRepo = props.params.owner + "/" + props.params.repo;
        var pr = props.params.pr;
        this.props.controller.getRequestDiffs(ownerRepo, pr, false);
    },

    onSubmitReplyToComment: function(path, lineComment, text) {
        return this.props.controller.postReplyLineComment(this.state.pr_info.pr, text, lineComment);
    },

    onSubmitLineComment: function(path, pos, text) {
        return this.props.controller.postLineComment(this.state.pr_info.pr, text, path, pos);
    },

    render: function() {
        var pr = this.state.pr_info.pr;
        if (!pr) {
            return <div>Loading pull request...</div>;
        }
        var fileDiffs = this.state.file_diffs ? this.state.file_diffs.files : [];
        var lineComments = this.state.line_comments ? this.state.line_comments.comments : [];
        return (
            <div>
            Actions
            </div>
        );
    }
});
