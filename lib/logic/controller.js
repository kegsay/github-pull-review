"use strict";
var Promise = require("bluebird");
var actions = require("./actions");
var apiMapper = require("./api-mapper");
var uri = require("./uri");
var PullRequest = require("./models/pull-request");

function Controller(dispatcher, httpApi, diffController) {
    this.dispatcher = dispatcher;
    this.httpApi = httpApi;
    this.diffController = diffController;
}

Controller.prototype.init = function() {
    this.dispatcher.register(this.onAction.bind(this));
}

Controller.prototype.onAction = function(payload) {
    switch (payload.action) {
        case "view_pr":
            this._view_pr(payload.data);
            break;
        case "token_update":
            this.httpApi.setAccessToken(payload.data.token);
            break;
        case "post_comment":
            if (payload.data.in_reply_to) {
                this._post_line_comment(
                    payload.data.comment_id,
                    payload.data.repo_id, payload.data.request_id, payload.data.text,
                    payload.data.in_reply_to, true
                );
            }
            else {
                this._post_comment(payload.data);
            }
            break;
        case "get_diffs":
            this._get_diffs(payload.data);
            this._get_diff_comments(payload.data);
            break;
        default:
            // do nothing
            break;
    }
};

Controller.prototype._post_comment = function(data) {
    var self = this;
    this.httpApi.postComment(
        data.repo_id, data.request_id, data.text
    ).finally(function() {
        self.dispatcher.dispatch(
            actions.create("post_comment_response", {
                comment_id: data.comment_id,
                response: "",
                is_error: false
            })
        );
        self.dispatcher.dispatch(actions.create("view_pr", {
            repo_id: data.repo_id,
            request_id: data.request_id
        }));
    });
};

Controller.prototype._post_line_comment = function(internalCommentId, repo, reqId, text,
                                                   lineComment, inReplyTo) {
    var self = this;
    if (inReplyTo && lineComment) {
        this.httpApi.postLineCommentResponse(
            repo, reqId, text, lineComment.getComment().getId()
        ).finally(function() {
            self.dispatcher.dispatch(
                actions.create("post_comment_response", {
                    comment_id: internalCommentId,
                    response: "",
                    is_error: false
                })
            );
            self.dispatcher.dispatch(actions.create("get_diffs", {
                repo: repo,
                id: reqId,
                allow_cached: false
            }));
        });
    }
};

Controller.prototype._view_pr = function(data) {
    var self = this;
    Promise.try(function() {
        return [
            self.httpApi.getPullRequest(data.repo_id, data.request_id),
            self.httpApi.getPullRequestComments(data.repo_id, data.request_id),
            self.httpApi.getPullRequestCommits(data.repo_id, data.request_id)
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

        var pullRequest = new PullRequest(data.repo_id, data.request_id);
        pullRequest.setLink(body.html_url);
        pullRequest.setTitle(body.title);
        pullRequest.setSourceDestRepos(body.head.label, body.base.label);
        pullRequest.setOwner(apiMapper.getUserFromGithubApi(body.user));
        pullRequest.setState(body.merged ? "merged" : body.state.toLowerCase());
        pullRequest.setComments(comments);
        pullRequest.setCommits(commits);
        pullRequest.setBaseSha(body.base.sha);
        if (body.merged) {
            pullRequest.setMerger(apiMapper.getUserFromGithubApi(body.merged_by));
        }

        window.location.hash = uri.encodeFragment(data.repo_id, data.request_id);
        self.dispatcher.dispatch(actions.create("pr_info", {
            pr: pullRequest
        }));
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
