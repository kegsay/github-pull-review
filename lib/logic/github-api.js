"use strict";
var request = require("request");
var Promise = require("bluebird");

// Link:
// <https://api.github.com/repositories/24918719/pulls/41/comments?page=2>; rel="next",
// <https://api.github.com/repositories/24918719/pulls/41/comments?page=2>; rel="last"
function parseLinkHeader(header) {
    if (!header || header.length === 0) {
        return {};
    }
    var parts = header.split(',');
    var links = {};
    // Parse each part into a named link
    for (var i = 0; i < parts.length; i++) {
        var section = parts[i].split(';');
        if (section.length !== 2) {
            continue; // something is weird with this link
        }
        var url = section[0].replace(/<(.*)>/, '$1').trim();
        var name = section[1].replace(/rel="(.*)"/, '$1').trim();
        links[name] = url;
    }
    return links;
}

function GithubApi(endpoint, supplementaryEndpoint, token) {
    this.url = endpoint;
    this.supplementaryUrl = supplementaryEndpoint;
    this.token = token;
}

GithubApi.prototype.setAccessToken = function(token) {
    this.token = token;
};

GithubApi.prototype.getUser = function() {
    return this._get("/user");
}

GithubApi.prototype.getPullRequests = function(repo) {
    return this._get("/repos/" + repo + "/pulls");
};

GithubApi.prototype.getPullRequest = function(repo, pr) {
    return this._get("/repos/" + repo + "/pulls/" + pr);
};

GithubApi.prototype.getLineComments = function(repo, pr) {
    return this._getAll(this.url + "/repos/" + repo + "/pulls/" + pr + "/comments");
};

GithubApi.prototype.getPullRequestComments = function(repo, pr) {
    return this._getAll(this.url + "/repos/" + repo + "/issues/" + pr + "/comments");
};

GithubApi.prototype.getPullRequestCommits = function(repo, pr) {
    // This is a bit cheeky since it's actually from the key 'commits_url'
    return this._get("/repos/" + repo + "/pulls/" + pr + "/commits");
}

GithubApi.prototype.getPullRequestDiffs = function(repo, pr) {
    return this._get("/repos/" + repo + "/pulls/" + pr + "/files");
};

GithubApi.prototype.getCommitDiffs = function(repo, commitA, commitB) {
    return this._get(
        "/repos/" + repo + "/compare/" + commitA + "..." + commitB
    );
};

GithubApi.prototype.getOpenPullRequests = function(user, relation) {
    return this._get("/search/issues?q=type:pr%20" + relation + ":" + user + "%20state:open");
};


GithubApi.prototype.postComment = function(repo, pr, text) {
    return this._post("/repos/" + repo + "/issues/" + pr + "/comments", {
        body: text
    });
};

GithubApi.prototype.postLineComment = function(repo, pr, text, sha, path, position) {
    return this._post("/repos/" + repo + "/pulls/" + pr + "/comments", {
        body: text,
        commit_id: sha,
        path: path,
        position: position
    });
};

GithubApi.prototype.postLineCommentResponse = function(repo, pr, text, commentId) {
    return this._post("/repos/" + repo + "/pulls/" + pr + "/comments", {
        body: text,
        in_reply_to: commentId
    });
};

GithubApi.prototype.merge = function(repo, pr, sha, commitMessage) {
    return this._put("/repos/" + repo + "/pulls/" + pr + "/merge", {
        sha: sha,
        commit_message: commitMessage
    });
};

GithubApi.prototype.squashMerge = function(sourceRepo, sourceRef, destRepo, destRef, commitMessage) {
    return this.getUser().then((userData) => {
        var data = {
            head_repo: sourceRepo,
            head_branch: sourceRef,
            base_repo: destRepo,
            base_branch: destRef,
            commit_message: commitMessage,
            username: userData.body.login,
            password: this.token
        };
        return this._req("POST", this.supplementaryUrl + "/squashmerge", data, true);
    });
};

GithubApi.prototype.squashBranch = function(repo, ref, baselineRepo, baselineRef, commitMessage) {
    return this.getUser().then((userData) => {
        var data = {
            repo: repo,
            branch: ref,
            baseline_repo: baselineRepo,
            baseline_branch: baselineRef,
            commit_message: commitMessage,
            username: userData.body.login,
            password: this.token
        };
        return this._req("POST", this.supplementaryUrl + "/rewritehistory", data, true);
    });
};

// resolve all Link: headers and cat them into the same response body array
GithubApi.prototype._getAll = function(url) {
    var self = this;
    return this._getUrl(url).then(function(response) {
        var links = parseLinkHeader(response.headers.link);
        if (links.next) {
            return self._getAll(links.next).then(function(nextResponse) {
                // extend the array with this new response
                response.body.push.apply(response.body, nextResponse.body);
                return response;
            });
        }
        return response;
    });
};

GithubApi.prototype._getUrl = function(url) {
    return this._req("GET", url);
};

GithubApi.prototype._get = function(path) {
    return this._req("GET", this.url + path);
};

GithubApi.prototype._post = function(path, data) {
    return this._req("POST", this.url + path, data);
};

GithubApi.prototype._put = function(path, data) {
    return this._req("PUT", this.url + path, data);
};

GithubApi.prototype._req = function(method, url, data, skipAuth) {
    var p = Promise.defer();
    var headers = !skipAuth && this.token ? { "Authorization": "token " + this.token } : {};
    request({
        uri: url,
        method: method,
        json: true,
        withCredentials: false,
        body: data,
        headers: headers
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
