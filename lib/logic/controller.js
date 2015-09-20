"use strict";
var Promise = require("bluebird");
var actions = require("./actions");

function Controller(dispatcher, httpApi) {
    this.dispatcher = dispatcher;
    this.httpApi = httpApi;
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
    }
};

Controller.prototype._view_pr = function(data) {
    var self = this;
    Promise.try(function() {
        return [
            self.httpApi.getPullRequest(data.repo_id, data.request_id),
            self.httpApi.getPullRequestComments(data.repo_id, data.request_id)
        ];
    }).spread(function(apiData, apiComments) {
        var body = apiData.body;
        console.log(JSON.stringify(apiComments, undefined, 2));

        var mergeObj = {};
        if (body.merged) {
            mergeObj.by = body.merged_by.login;
            mergeObj.by_url = body.merged_by.html_url;
        }

        var comments = apiComments.body.map(function(apiComment) {
            return {
                body: apiComment.body,
                by: apiComment.user.login,
                by_url: apiComment.user.html_url
            };
        });

        var info = {
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
            merged: mergeObj
        };
        self.dispatcher.dispatch(actions.create("pr_info", info));
    }, function(err) {
        console.error(err);
    });
};

module.exports = Controller;
