import {PullRequestTrigger} from "../logic/triggers";
var TriggerMixin = require("../logic/triggers").TriggerMixin([
    PullRequestTrigger
]);
var React = require("react");
var CommentListView = require("../components/comment-list-view");

module.exports = React.createClass({displayName: 'HistoryPage',
    mixins: [TriggerMixin],

    componentDidMount: function() {
        this.setTrigger(
            new PullRequestTrigger(this.props.controller.getPullRequest())
        );
    },

    onSubmitOverviewComment: function(text) {
        return this.props.controller.postOverviewComment(
            this.getTrigger(PullRequestTrigger).pr, text
        );
    },

    render: function() {
        var pr = this.getTrigger(PullRequestTrigger).pr;
        if (!pr) {
            return <div>Loading pull request...</div>;
        }
        return (
            <CommentListView comments={pr.getComments()} showCommentBox={true}
                        onSubmitComment={this.onSubmitOverviewComment} />
        );
    }
});
