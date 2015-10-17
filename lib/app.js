"use strict";

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

var pathsToPages = {
    "/commits": "commits",
    "/diffs": "diffs",
    "/history": "history"
}
var page = "history";
if (window.location.hash) {
    var queryParams = uri.decodeFragment(window.location.hash.split("?")[1]);
    var path = (window.location.hash.split("?")[0] || "").substring(1);
    page = pathsToPages[path] || "history";
    if (queryParams.repo && queryParams.pr) {
        sessionStore.setRepositoryId(queryParams.repo);
        sessionStore.setRequestId(queryParams.pr);
    }
}

React.render(
    <MainPage controller={ctrl} page={page} />,
    document.getElementById("container")
);

module.exports = {
    ctrl: ctrl
};
