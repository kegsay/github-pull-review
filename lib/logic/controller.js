"use strict";
var Promise = require("bluebird");
var actions = require("./actions");
var apiMapper = require("./api-mapper");
var uri = require("./uri");

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
            this._post_comment(payload.data);
            break;
        case "get_diffs":
            this._get_diffs(payload.data);
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

        var mergeObj = {};
        if (body.merged) {
            mergeObj.by = body.merged_by.login;
            mergeObj.by_url = body.merged_by.html_url;
        }

        var info = {
            owner_repo: data.repo_id,
            id: data.request_id,
            html_link: body.html_url,
            title: body.title,
            num_commits: body.commits,
            src_repo: body.head.label,
            dst_repo: body.base.label,
            owner: body.user.login,
            owner_url: body.user.html_url,
            state: body.merged ? "merged" : body.state.toLowerCase(),
            comments: comments,
            commits: commits,
            merged: mergeObj
        };
        window.location.hash = uri.encodeFragment(data.repo_id, data.request_id);
        self.dispatcher.dispatch(actions.create("pr_info", info));
    }, function(err) {
        console.error(err);
    });
};

Controller.prototype._get_diffs = function(data) {
    this.diffController.getPullRequestDiffs(data.repo, data.id).done(function(diffs) {
        console.log("Got diffs: %s", JSON.stringify(diffs));
    }, function(e) {
        console.error("Err getting diffs: %s", JSON.stringify(e));
    });
}

module.exports = Controller;
