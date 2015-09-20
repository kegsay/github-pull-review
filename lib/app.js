"use strict";
var MainPage = require("./components/main-page");
var Controller = require("./logic/controller");
var GithubApi = require("./logic/github-api");
var SessionStore = require("./logic/session-store");

// do the logic dependency graph ^___^
var sessionStore = new SessionStore(window.localStorage);
var dispatcher = require("./logic/dispatcher");
var httpApi = new GithubApi(
    "https://api.github.com", sessionStore.getAccessToken()
);
console.log(httpApi);
var ctrl = new Controller(dispatcher, httpApi);

ctrl.init();

React.render(
    React.createElement(MainPage),
    document.getElementById("container")
);

module.exports = {
    ctrl: ctrl
};
