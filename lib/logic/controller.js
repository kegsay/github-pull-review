"use strict";
var Promise = require("bluebird");
var triggers = require("./triggers");
var apiMapper = require("./api-mapper");
var PullRequest = require("./models/pull-request");

function Controller(dispatcher, httpApi, diffController, githubDelays) {
    this.dispatcher = dispatcher;
    this.httpApi = httpApi;
    this.diffController = diffController;
    this.githubDelays = githubDelays;
    this._currentPullRequest = null;
}

Controller.prototype.init = function() {
    this.dispatcher.register(this.onAction.bind(this));
};

Controller.prototype.getPullRequest = function() {
    return this._currentPullRequest;
};

Controller.prototype.onAction = function(payload) {
    switch (payload.name) {
        default:
            // do nothing
            break;
    }
};

Controller.prototype.getRequestDiffs = function(repo, prId, allowCached) {
    this._get_diffs(repo, prId, allowCached);
    this._get_diff_comments(repo, prId);
};

Controller.prototype.updateAccessToken = function(token) {
    this.httpApi.setAccessToken(token);
};

Controller.prototype.postOverviewComment = function(pr, text) {
    var self = this;
    var promise = this.httpApi.postComment(pr.getRepo(), pr.getId(), text);
    promise.finally(function() {
        self.retrievePullRequest(pr.getRepo(), pr.getId(), true);
    })
    return promise;
};

Controller.prototype.postReplyLineComment = function(pr, text, inReplyTo) {
    var self = this;
    var promise = this.httpApi.postLineCommentResponse(
        pr.getRepo(), pr.getId(), text, inReplyTo.getComment().getId()
    );
    promise.finally(function() {
        self.getRequestDiffs(pr.getRepo(), pr.getId(), false);
    });
    return promise;
};

Controller.prototype.postLineComment = function(pr, text, path, pos) {
    var self = this;
    var promise = this.httpApi.postLineComment(
        pr.getRepo(), pr.getId(), text, pr.getSource().getSha(), path, pos
    );
    promise.finally(function() {
        self.getRequestDiffs(pr.getRepo(), pr.getId(), false);
    });
    return promise;
};

Controller.prototype.getCommitDiffs = function(repo, fromSha, toSha, filePath) {
    var self = this;
    return Promise.try(function() {
        return self.httpApi.getCommitDiffs(repo, fromSha, toSha);
    }).then(function(apiDiffs) {
        var diffs = apiMapper.getCommitDiffsFromGithubApi(apiDiffs.body);
        diffs = diffs.filter(function(diff) {
            return diff.getFilePath() === filePath;
        });
        return diffs[0];
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
        pullRequest.setBody(body.body);
        pullRequest.setSource(apiMapper.getRefFromGithubApi(body.head));
        pullRequest.setDest(apiMapper.getRefFromGithubApi(body.base));
        pullRequest.setOwner(apiMapper.getUserFromGithubApi(body.user));
        if (body.assignee) {
            pullRequest.setAssignee(apiMapper.getUserFromGithubApi(body.assignee));
        }
        pullRequest.setState(body.merged ? "merged" : body.state.toLowerCase());
        pullRequest.setComments(comments);
        pullRequest.setCommits(commits);
        if (body.merged) {
            pullRequest.setMerger(apiMapper.getUserFromGithubApi(body.merged_by));
        }
        if (body.mergeable !== null) {
            pullRequest.setMergeable(body.mergeable);
        }
        if (dispatch) {
            console.log("Dispatching PullRequestTrigger");
            self._currentPullRequest = pullRequest;
            self.dispatcher.dispatch(new triggers.PullRequestTrigger(pullRequest));
            console.log("Dispatched PullRequestTrigger");
        }
        return pullRequest;
    }, function(err) {
        console.error(err);
    });
};

Controller.prototype.refresh = function() {
    this.retrievePullRequest(
        this.getPullRequest().getRepo(),
        this.getPullRequest().getId(),
        true
    );
}

Controller.prototype._get_diffs = function(repo, id, allowCached) {
    var self = this;
    this.diffController.getPullRequestDiffs(repo, id, allowCached).done(
    function(diffs) {
        self.dispatcher.dispatch(
            new triggers.FileDiffsTrigger(diffs)
        );
    }, function(e) {
        console.error("Err getting diffs: %s", JSON.stringify(e));
        console.error(e.stack);
    });
};

Controller.prototype._get_diff_comments = function(repo, prId) {
    var self = this;
    Promise.try(function() {
        return self.httpApi.getLineComments(repo, prId);
    }).done(function(apiData) {
        var lineComments = apiMapper.getLineCommentsFromGithubApi(apiData.body);
        self.dispatcher.dispatch(
            new triggers.LineCommentsTrigger(lineComments)
        );
    }, function(err) {
        console.error("Err getting line comments: " + err);
        console.error(err.stack);
    });
};

Controller.prototype.squashMergeWithRewrite = function(pr, commitMessage, email) {
    return Promise.try(() => this.httpApi.squashBranch(
            pr.getSource().getRepo().getCloneUrl(),
            pr.getSource().getRef(),
            pr.getDest().getRepo().getCloneUrl(),
            pr.getDest().getRef(),
            commitMessage,
            email
        ))
        .then((apiData) => this.waitUntilMergable(pr).then(() => Promise.resolve(apiData)))
        .then((apiData) => this.merge(pr, commitMessage, apiData.body.sha))
        .then(() => this.waitUntilClosed(pr))
        .then(() => this.refresh())
        .catch((err) => this._handleMergeError(err));
};

Controller.prototype.squashMergeWithoutRewrite = function(pr, commitMessage, email) {
    return Promise.try(() =>
        this.httpApi.squashMerge(
            pr.getSource().getRepo().getCloneUrl(),
            pr.getSource().getRef(),
            pr.getDest().getRepo().getCloneUrl(),
            pr.getDest().getRef(),
            commitMessage,
            email
        ))
        .delay(this.githubDelays.POST_MERGE_MS)
        .then(() => this.refresh())
        .catch((err) => this._handleMergeError(err));
};

Controller.prototype.merge = function(pr, commitMessage, opt_sha) {
    return Promise.try(() =>
        this.httpApi.merge(
            pr.getRepo(),
            pr.getId(),
            opt_sha || pr.getSource().getSha(),
            commitMessage
        ))
        .then(() => this.waitUntilClosed(pr))
        .then(() => this.refresh())
        .catch((err) => this._handleMergeError(err));
};

Controller.prototype.close = function(pr) {
    return this.httpApi.close(
        pr.getRepo(),
        pr.getId()
    )
    .then(() => this.refresh());
};

Controller.prototype.open = function(pr) {
    return this.httpApi.open(
        pr.getRepo(),
        pr.getId()
    )
    .delay(200) // In hopes that we'll get a mergeable value
    .then(() => this.refresh());
};

Controller.prototype.waitUntilMergable = function(pr) {
    var mergeable = false;
    return this._while(
        () => !mergeable,
        () => this.httpApi.getPullRequest(pr.getRepo(), pr.getId())
                .then((res) => { mergeable = res.body.mergeable; }),
        200
    );
};

Controller.prototype.waitUntilClosed = function(pr) {
    var closed = false;
    return this._while(
        () => !closed,
        () => this.httpApi.getPullRequest(pr.getRepo(), pr.getId())
                .then((res) => { closed = res.body.state === "closed"; }),
        200
    );
};

Controller.prototype.getEmailAddresses = function() {
    return this.httpApi.getEmailAddresses()
        .then((body) => {
            this.dispatcher.dispatch(new triggers.EmailAddressesTrigger(body));
        });
};

Controller.prototype._handleMergeError = function(err) {
    console.error("Got merge error: %s", JSON.stringify(err));
    this.dispatcher.dispatch(
        new triggers.MergeErrorTrigger({"error": "Error merging"})
    );
};

/**
 * _while returns a promise which is resolved when condition() is true, repeatedly calling fn()
 * between checks of condition().
 */
Controller.prototype._while = function(condition, fn, opt_delay_ms) {
    var delay_ms = opt_delay_ms || 0;
    var loop;
    var promise = new Promise((res) => {
        loop = () => {
            if (!condition()) {
                res();
                return;
            }
            return Promise.delay(delay).then(fn).then(loop)
        };
    });

    process.nextTick(loop);

    return promise;
};

module.exports = Controller;
