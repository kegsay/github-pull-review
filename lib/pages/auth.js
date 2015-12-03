var React = require("react");
var querystring = require("querystring");
var PrSearcher = require("../components/pr-searcher");

const IDENTITY_SCOPES = ["user", "user:email"];
const PUBLIC_SCOPES = IDENTITY_SCOPES.concat(["public_repo"]);
const ALL_SCOPES = PUBLIC_SCOPES.concat(["repo"]);

module.exports = React.createClass({displayName: 'AuthPage',

    propTypes: {
        controller: React.PropTypes.any.isRequired,
        sessionStore: React.PropTypes.any
    },

    componentDidMount: function() {
        if (window.location.search && window.location.search[0] === "?") {
            var qs = querystring.parse(window.location.search.substring(1));
            if (qs.token) {
                // These should really probably be one call...
                this.props.sessionStore.setAccessToken(qs.token);
                this.props.controller.updateAccessToken(qs.token);
                window.location.search = ""; // Clear token from querystring
            }
        }
        if (this.props.sessionStore.getAccessToken()) {
            this.props.history.pushState(null, "/list");
        }
    },

    auth: function(scopes) {
        this.props.controller.authenticate(scopes);
    },

    render: function() {
        return (
            <div>
                <span onClick={this.auth.bind(this, ALL_SCOPES)} className="LoginButton">
                    Log in with full access
                </span> (this allows you to leave comments and merge PRs)
                <br /><br />
                <span onClick={this.auth.bind(this, PUBLIC_SCOPES)} className="LoginButton">
                    Log in with public access
                </span> (this allows you to leave comments and merge PRs, but only for public repos)
                <br /><br />
                <span onClick={this.auth.bind(this, IDENTITY_SCOPES)} className="LoginButton">
                    Log in with read-only access
                </span> (this allows you to view PRs to public repos,
                and see personalized dashboards)
                <br /><br />
                <PrSearcher controller={this.props.controller} history={this.props.history} />
            </div>
        );
    }
});
