var InfoGetter = require("./info-getter");
var PullRequestOverview = require("./pull-request-overview");

module.exports = React.createClass({displayName: 'MainPage',
    propTypes: {
        controller: React.PropTypes.any,
        page: React.PropTypes.any
    },

    onSubmitOverviewComment: function(pr, text) {
        return this.props.controller.postOverviewComment(pr, text)
    },

    onReplyToComment: function(pr, path, lineComment, text) {
        return this.props.controller.postReplyLineComment(pr, text, lineComment);
    },

    onSubmitLineComment: function(pr, path, pos, text) {
        return this.props.controller.postLineComment(pr, text, path, pos);
    },

    render: function() {
        return (
            <div>
                <InfoGetter />
                <PullRequestOverview
                    onSubmitOverviewComment={this.onSubmitOverviewComment}
                    onReplyToComment={this.onReplyToComment}
                    onSubmitLineComment={this.onSubmitLineComment}
                    page={this.props.page}/>
            </div>
        );
    }
});
