"use strict";
var React = require("react");
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var MainPage = require("./components/main-page");
var Controller = require("./logic/controller");
var GithubApi = require("./logic/github-api");
var SessionStore = require("./logic/session-store");
var DiffController = require("./logic/diff-controller");
var uri = require("./logic/uri");

// do the logic dependency graph ^___^
var sessionStore = new SessionStore(window.localStorage);
var dispatcher = require("./logic/dispatcher");
var httpApi = new GithubApi(
    "https://api.github.com", sessionStore.getAccessToken()
);
var diffController = new DiffController(httpApi);
var ctrl = new Controller(dispatcher, httpApi, diffController);

ctrl.init();

var MainPageWrapper = React.createClass({
  render: function () {
    return (
        <MainPage {...this.props} controller={ctrl} />
    );
  }
});

React.render(
    <Router>
        <Route path="/repos/:owner/:repo/:pr/:page"
        component={MainPageWrapper} />
    </Router>,
    document.getElementById("container")
);

module.exports = {
    ctrl: ctrl
};
