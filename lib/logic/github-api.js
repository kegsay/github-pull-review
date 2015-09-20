"use strict";
var request = require("request");
var Promise = require("bluebird");

function GithubApi(endpoint, token) {
    this.url = endpoint;
    this.token = token;
}

GithubApi.prototype.setAccessToken = function(token) {
    this.token = token;
};

GithubApi.prototype.getPullRequests = function(repo) {
    return this._get("/repos/" + repo + "/pulls");
};

GithubApi.prototype.getPullRequest = function(repo, pr) {
    return this._get("/repos/" + repo + "/pulls/" + pr);
};

GithubApi.prototype.getLineComments = function(repo, pr) {
    return this._get("/repos/" + repo + "/pulls/" + pr + "/comments");
};

GithubApi.prototype.getPullRequestComments = function(repo, pr) {
    return this._get("/repos/" + repo + "/issues/" + pr + "/comments");
};

GithubApi.prototype._get = function(path) {
    var p = Promise.defer();
    var qs = this.token ? { access_token: this.token } : {};
    request({
        uri: (this.url + path),
        method: "GET",
        json: true,
        withCredentials: false,
        qs: qs
    }, function(err, response, body) {
        if (err) {
            p.reject(err);
            return;
        }
        if (response.statusCode >= 300 || response.statusCode < 200) {
            p.reject(response);
            return;
        }
        p.resolve(response);
    });
    return p.promise;
}

module.exports = GithubApi;
