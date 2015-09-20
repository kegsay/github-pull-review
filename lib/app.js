"use strict";
var MainPage = require("./components/main-page");
var Controller = require("./logic/controller");
var GithubApi = require("./logic/github-api");

// do the logic dependency graph ^___^
var dispatcher = require("./logic/dispatcher");
var httpApi = new GithubApi("https://api.github.com");
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
