"use strict";
var request = require("request");

function GithubApi(endpoint, token) {
    this.url = endpoint;
    this.token = token;
}

GithubApi.prototype.getPullRequests = function(repo) {
    return this._get("/repos/" + repo + "/pulls");
};

GithubApi.prototype._get = function(path) {
    request({
        uri: (this.url + path),
        method: "GET",
        json: true,
        withCredentials: false,
        qs: {
            access_token: this.token
        }
    }, function(err, data) {
        console.log("Err: %s Data: %s", err, data);
    });
}

module.exports = GithubApi;
