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

    getInitialState: function() {
        return {
            accessToken: ""
        };
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

    onSubmitToken: function(ev) {
        this.props.sessionStore.setAccessToken(this.state.accessToken);
        this.props.controller.updateAccessToken(this.state.accessToken);
        this.props.history.pushState(null, "/list");
    },

    auth: function(scopes) {
        this.props.controller.authenticate(scopes);
    },

    render: function() {
        var self = this;
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
                <div>
                    Alternatively, enter your personal access token:
                    <span>Requires scopes: user,user:email,public_repo,repo</span>
                    <input type="text" placeholder="Enter access token" value={this.state.accessToken}
                        onChange={function(ev) { self.setState({ accessToken: ev.target.value });} } />
                    <button onClick={this.onSubmitToken}>Login</button>
                </div>
                <PrSearcher controller={this.props.controller} history={this.props.history} />
            </div>
        );
    }
});
