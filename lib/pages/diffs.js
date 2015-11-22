import {PullRequestTrigger, FileDiffsTrigger, LineCommentsTrigger} from "../logic/triggers";
var TriggerMixin = require("../logic/triggers").TriggerMixin([
    PullRequestTrigger, FileDiffsTrigger, LineCommentsTrigger
]);
var React = require("react");
var FileDiffListView = require("../components/file-diff-list-view");

module.exports = React.createClass({displayName: 'DiffsPage',
    mixins: [TriggerMixin],

    propTypes: {
        controller: React.PropTypes.any.isRequired
    },

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
            this.setTrigger(new PullRequestTrigger(pullRequest));
        }
        var ownerRepo = props.params.owner + "/" + props.params.repo;
        var pr = props.params.pr;
        this.props.controller.getRequestDiffs(ownerRepo, pr, false);
    },

    onSubmitReplyToComment: function(path, lineComment, text) {
        return this.props.controller.postReplyLineComment(
            this.getTrigger(PullRequestTrigger).pr, text, lineComment
        );
    },

    onSubmitLineComment: function(path, pos, text) {
        return this.props.controller.postLineComment(
            this.getTrigger(PullRequestTrigger).pr, text, path, pos
        );
    },

    render: function() {
        var pr = this.getTrigger(PullRequestTrigger).pr;
        if (!pr) {
            return <div>Loading pull request...</div>;
        }
        var fileDiffs = this.getTrigger(FileDiffsTrigger).files || [];
        var lineComments = this.getTrigger(LineCommentsTrigger).comments || [];
        return (
            <FileDiffListView diffs={fileDiffs} comments={lineComments} pr={pr}
                onReplyToComment={this.onSubmitReplyToComment}
                onLineComment={this.onSubmitLineComment}
                controller={this.props.controller} />
        );
    }
});
