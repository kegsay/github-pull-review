"use strict";
var Promise = require("bluebird");
var actions = require("./actions");
var apiMapper = require("./api-mapper");
var PullRequest = require("./models/pull-request");

function Controller(dispatcher, httpApi, diffController) {
    this.dispatcher = dispatcher;
    this.httpApi = httpApi;
    this.diffController = diffController;
    this._currentPullRequest = null;
}

Controller.prototype.init = function() {
    this.dispatcher.register(this.onAction.bind(this));
};

Controller.prototype.getPullRequest = function() {
    return this._currentPullRequest;
};

Controller.prototype.onAction = function(payload) {
    var data = payload.data;
    switch (payload.action) {
        case "get_commit_diffs":
            this._get_commit_diffs(data.pr.getRepo(), data.from, data.to, data.file_path);
            break;
        case "get_diffs":
            this._get_diffs(data);
            this._get_diff_comments(data);
            break;
        default:
            // do nothing
            break;
    }
};

Controller.prototype.getRequestDiffs = function(repo, pr, allowCached) {
    var data = {
        repo: repo,
        id: pr,
        allow_cached: allowCached
    };
    this._get_diffs(data);
    this._get_diff_comments(data);
};

Controller.prototype.updateAccessToken = function(token) {
    this.httpApi.setAccessToken(token);
};

Controller.prototype.postOverviewComment = function(pr, text) {
    var self = this;
    var promise = this.httpApi.postComment(pr.getRepo(), pr.getId(), text);
    promise.finally(function() {
        self.retrievePullRequest(pr.getRepo(), pr.getId());
    })
    return promise;
};

Controller.prototype.postReplyLineComment = function(pr, text, inReplyTo) {
    var self = this;
    var promise = this.httpApi.postLineCommentResponse(
        pr.getRepo(), pr.getId(), text, inReplyTo.getComment().getId()
    );
    promise.finally(function() {
        self._refreshDiffs(pr);
    });
    return promise;
};

Controller.prototype._refreshDiffs = function(pr) {
    this.dispatcher.dispatch(actions.create("get_diffs", {
        repo: pr.getRepo(),
        id: pr.getId(),
        allow_cached: false
    }));
};

Controller.prototype.postLineComment = function(pr, text, path, pos) {
    var self = this;
    var promise = this.httpApi.postLineComment(
        pr.getRepo(), pr.getId(), text, pr.getHeadSha(), path, pos
    );
    promise.finally(function() {
        self._refreshDiffs(pr);
    });
    return promise;
};

Controller.prototype._get_commit_diffs = function(repo, fromSha, toSha, filePath) {
    var self = this;
    Promise.try(function() {
        return self.httpApi.getCommitDiffs(repo, fromSha, toSha);
    }).done(function(apiDiffs) {
        var diffs = apiMapper.getCommitDiffsFromGithubApi(apiDiffs.body);
        diffs = diffs.filter(function(diff) {
            return diff.getFilePath() === filePath;
        });
        self.dispatcher.dispatch(
            actions.create("get_commit_diffs_response", {
                diff: diffs[0]
            })
        );
    }, function(e) {
        console.error("Failed to get commit diffs on %s between %s and %s", repo, fromSha, toSha);
        console.error(e.stack);
    });
};

Controller.prototype.retrievePullRequest = function(repo, pr, dispatch) {
    console.log("Retrieving pull request #%s (%s)", pr, repo);
    var self = this;
    return Promise.try(function() {
        return [
            self.httpApi.getPullRequest(repo, pr),
            self.httpApi.getPullRequestComments(repo, pr),
            self.httpApi.getPullRequestCommits(repo, pr)
        ];
    }).spread(function(apiData, apiComments, apiCommits) {
        var body = apiData.body;
        // console.log(JSON.stringify(body, undefined, 2));
        var comments = apiMapper.getCommentsFromGithubApi(
            apiComments.body, apiData.body
        );
        var commits = apiMapper.getCommitsFromGithubApi(
            apiCommits.body, apiData.body
        ).commits;

        var pullRequest = new PullRequest(repo, pr);
        pullRequest.setLink(body.html_url);
        pullRequest.setTitle(body.title);
        pullRequest.setSourceDestRepos(body.head.label, body.base.label);
        pullRequest.setOwner(apiMapper.getUserFromGithubApi(body.user));
        if (body.assignee) {
            pullRequest.setAssignee(apiMapper.getUserFromGithubApi(body.assignee));
        }
        pullRequest.setState(body.merged ? "merged" : body.state.toLowerCase());
        pullRequest.setComments(comments);
        pullRequest.setCommits(commits);
        pullRequest.setBaseSha(body.base.sha);
        // we can't base this off the commits from /commits,
        // it's sometimes wrong (dunno conditions)
        pullRequest.setHeadSha(body.head.sha);
        if (body.merged) {
            pullRequest.setMerger(apiMapper.getUserFromGithubApi(body.merged_by));
        }
        if (dispatch) {
            console.log("Dispatching pr_info");
            self._currentPullRequest = pullRequest;
            self.dispatcher.dispatch(actions.create("pr_info", {
                pr: pullRequest
            }));
            console.log("Dispatched pr_info");
        }
        return pullRequest;
    }, function(err) {
        console.error(err);
    });
};

Controller.prototype._get_diffs = function(data) {
    var self = this;
    this.diffController.getPullRequestDiffs(data.repo, data.id, data.allow_cached).done(
    function(diffs) {
        self.dispatcher.dispatch(actions.create("file_diffs", {
            files: diffs
        }));
    }, function(e) {
        console.error("Err getting diffs: %s", JSON.stringify(e));
        console.error(e.stack);
    });
};

Controller.prototype._get_diff_comments = function(data) {
    var self = this;
    Promise.try(function() {
        return self.httpApi.getLineComments(data.repo, data.id);
    }).done(function(apiData) {
        var lineComments = apiMapper.getLineCommentsFromGithubApi(apiData.body);
        self.dispatcher.dispatch(actions.create("line_comments", {
            comments: lineComments
        }));
    }, function(err) {
        console.error("Err getting line comments: " + err);
        console.error(err.stack);
    });
};

module.exports = Controller;
