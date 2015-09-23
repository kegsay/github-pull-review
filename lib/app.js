"use strict";
var MainPage = require("./components/main-page");
var Controller = require("./logic/controller");
var GithubApi = require("./logic/github-api");
var SessionStore = require("./logic/session-store");
var uri = require("./logic/uri");

// do the logic dependency graph ^___^
var sessionStore = new SessionStore(window.localStorage);
var dispatcher = require("./logic/dispatcher");
var httpApi = new GithubApi(
    "https://api.github.com", sessionStore.getAccessToken()
);
var ctrl = new Controller(dispatcher, httpApi);

ctrl.init();

if (window.location.hash) {
    var params = uri.decodeFragment(window.location.hash);
    if (params.repo && params.pr) {
        sessionStore.setRepositoryId(params.repo);
        sessionStore.setRequestId(params.pr);
    }
}

React.render(
    React.createElement(MainPage),
    document.getElementById("container")
);

module.exports = {
    ctrl: ctrl
};
