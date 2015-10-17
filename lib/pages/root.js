var React = require("react");
var InfoGetter = require("../components/info-getter");

module.exports = React.createClass({displayName: 'RootPage',
    propTypes: {
        controller: React.PropTypes.any,
        sessionStore: React.PropTypes.any
    },

    onUpdateToken: function(token) {
        this.props.controller.updateAccessToken(token);
        this.props.sessionStore.setAccessToken(token);
    },

    onViewPullRequest: function(repo, pr) {
        this.props.history.pushState(null, `/repos/${repo}/${pr}/history`);
    },

    render: function() {
        var ownerRepo = this.props.params.owner + "/" + this.props.params.repo;
        var pr = this.props.params.pr;
        if (pr) {
            this.props.sessionStore.setRepositoryId(ownerRepo);
            this.props.sessionStore.setRequestId(pr);
        }
        return (
            <div>
                <InfoGetter
                    token={this.props.sessionStore.getAccessToken()}
                    repo={this.props.sessionStore.getRepositoryId()}
                    pr={this.props.sessionStore.getRequestId()}
                    onViewPullRequest={this.onViewPullRequest}
                    onUpdateToken={this.onUpdateToken} />
                {this.props.children}
            </div>
        );
    }
});
