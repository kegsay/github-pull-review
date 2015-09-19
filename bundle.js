(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var MainPage = require("./components/main-page");

React.render(
    React.createElement(MainPage),
    document.getElementById('container')
);

},{"./components/main-page":3}],2:[function(require,module,exports){
var ID_ACCESS_TOKEN = "info_access_token";
var ID_OWNER_REPO = "info_owner_repo";
var ID_PR_NUM = "info_pr_num";

var IDS = [
    ID_ACCESS_TOKEN, ID_PR_NUM, ID_OWNER_REPO
];

module.exports = React.createClass({displayName: 'InfoGetter',

    getInitialState: function() {
        var initial = {};
        IDS.forEach(function(id) {
            initial[id] = localStorage.getItem(id);
        });
        return initial;
    },

    handleChange: function(event) {
        var changeState = {};
        changeState[event.target.id] = event.target.value;
        this.setState(changeState);
        localStorage.setItem(event.target.id, event.target.value);
    },

    render: function() {
        var ele = React.createElement.bind(React);
        var token = this.state.token;
        return ele("div", null, [
            ele("input", {
                type: "text", placeholder: "access_token",
                id: ID_ACCESS_TOKEN,
                value: this.state[ID_ACCESS_TOKEN],
                onChange: this.handleChange
            }),
            ele("div", null, [
                ele("input", {
                    type: "text", placeholder: "owner/repo",
                    id: ID_OWNER_REPO,
                    value: this.state[ID_OWNER_REPO],
                    onChange: this.handleChange
                }),
                ele("input", {
                    type: "text", placeholder: "Pull Request #",
                    id: ID_PR_NUM,
                    value: this.state[ID_PR_NUM],
                    onChange: this.handleChange
                })
            ])
        ]);
    }
});

},{}],3:[function(require,module,exports){
var InfoGetter = require("./info-getter");

module.exports = React.createClass({displayName: 'MainPage',
    render: function() {
        return React.createElement("div", null,
            React.createElement(InfoGetter)
        );
    }
});

},{"./info-getter":2}]},{},[1]);
