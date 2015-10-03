var InfoGetter = require("./info-getter");
var PullRequestOverview = require("./pull-request-overview");

module.exports = React.createClass({displayName: 'MainPage',
    propTypes: {
        controller: React.PropTypes.any
    },

    onSubmitOverviewComment: function(pr, text) {
        return this.props.controller.postOverviewComment(pr, text)
    },

    onReplyToComment: function(pr, path, lineComment, text) {
        return this.props.controller.postReplyLineComment(pr, text, lineComment);
    },

    render: function() {
        return (
            <div>
                <InfoGetter />
                <PullRequestOverview
                    onSubmitOverviewComment={this.onSubmitOverviewComment}
                    onReplyToComment={this.onReplyToComment} />
            </div>
        );
    }
});
