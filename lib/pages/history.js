var React = require("react");
var TriggerMixin = require("../logic/triggers").TriggerMixin([
    "pr_info"
]);
var CommentListView = require("../components/comment-list-view");

module.exports = React.createClass({displayName: 'HistoryPage',
    mixins: [TriggerMixin],

    componentDidMount: function() {
        this.setState({
            pr_info: {
                pr: this.props.controller.getPullRequest()
            }
        });
    },

    onSubmitOverviewComment: function(text) {
        return this.props.controller.postOverviewComment(this.state.pr_info.pr, text);
    },

    render: function() {
        var pr = this.state.pr_info.pr;
        if (!pr) {
            return <div>Loading pull request...</div>;
        }
        return (
            <CommentListView comments={pr.getComments()} showCommentBox={true}
                        onSubmitComment={this.onSubmitOverviewComment} />
        );
    }
});
