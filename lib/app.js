"use strict";
var React = require("react");
var ReactDOM = require("react-dom");
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var IndexRoute = ReactRouter.IndexRoute;

var Controller = require("./logic/controller");
var GithubApi = require("./logic/github-api");
var SessionStore = require("./logic/session-store");
var DiffController = require("./logic/diff-controller");

// do the logic dependency graph ^___^
var sessionStore = new SessionStore(window.localStorage);
var dispatcher = require("./logic/dispatcher");
var httpApi = new GithubApi(
    "https://api.github.com", sessionStore.getAccessToken()
);
var diffController = new DiffController(httpApi);
var ctrl = new Controller(dispatcher, httpApi, diffController);
ctrl.init();

// grab the page classes
var RootPage = require("./pages/root");
var PullRequestPage = require("./pages/pr");
var CommitsPage = require("./pages/commits");
var DiffsPage = require("./pages/diffs");
var HistoryPage = require("./pages/history");
var ActionsPage = require("./pages/actions");

// wrap each component so we can pass in props (the controller)
var wrapComponent = function(Component, props) {
    return React.createClass({
        render: function() {
            props = props || {};
            var completeProps = props;
            var self = this;
            Object.keys(this.props).forEach(function(k) {
                completeProps[k] = self.props[k];
            })
            return React.createElement(Component, completeProps);
        }
    });
};

var pageProps = {
    controller: ctrl,
    sessionStore: sessionStore
};

ReactDOM.render(
    <Router>
        <Route path="/" component={wrapComponent(RootPage, pageProps)}>
            <Route path="repos/:owner/:repo/:pr" component={wrapComponent(PullRequestPage, pageProps)}>
                <IndexRoute component={wrapComponent(HistoryPage, pageProps)} />
                <Route path="commits" component={wrapComponent(CommitsPage, pageProps)}/>
                <Route path="diffs" component={wrapComponent(DiffsPage, pageProps)}/>
                <Route path="history" component={wrapComponent(HistoryPage, pageProps)}/>
                <Route path="actions" component={wrapComponent(ActionsPage, pageProps)}/>
            </Route>
        </Route>
    </Router>,
    document.getElementById("container")
);

module.exports = {
    ctrl: ctrl
};
