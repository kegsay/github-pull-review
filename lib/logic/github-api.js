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
// POST /repos/:owner/:repo/issues/:number/comments

GithubApi.prototype.postComment = function(repo, pr, text) {
    return this._post("/repos/" + repo + "/issues/" + pr + "/comments", {
        body: text
    });
};

GithubApi.prototype._get = function(path) {
    return this._req("GET", path);
};

GithubApi.prototype._post = function(path, data) {
    return this._req("POST", path, data);
};

GithubApi.prototype._req = function(method, path, data) {
    var p = Promise.defer();
    var qs = this.token ? { access_token: this.token } : {};
    request({
        uri: (this.url + path),
        method: method,
        json: true,
        withCredentials: false,
        body: data,
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
