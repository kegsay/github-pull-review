var React = require("react");
var InfoGetter = require("./info-getter");
var PullRequestOverview = require("./pull-request-overview");
var SessionStore = require("../logic/session-store");

module.exports = React.createClass({displayName: 'MainPage',
    propTypes: {
        controller: React.PropTypes.any
    },

    componentDidMount: function() {
        console.log("mounted %s", JSON.stringify(this.props));
        var sessionStore = new SessionStore(window.localStorage);
        sessionStore.setRepositoryId(this.props.params.owner + "/" + this.props.params.repo);
        sessionStore.setRequestId(this.props.params.pr);
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
                    page={this.props.params.page}/>
            </div>
        );
    }
});
