"use strict";
var triggers = require("./triggers");
var Promise = require("bluebird");
var apiMapper = require("./api-mapper");

function ListController(dispatcher, httpApi, controller) {
    this.dispatcher = dispatcher;
    this.httpApi = httpApi;
    this.controller = controller;
}

ListController.prototype.getOpenPullRequests = function() {
    Promise.try(() =>
        this.httpApi.getUser()
            .then((userData) =>
                Promise.try(() =>
                    this.httpApi.getOpenPullRequests(userData.body.login, "involves")
                        .then((prs) => this._fillComments(prs))
                        .then((prs) => this._loadPulls(
                            prs,
                            apiMapper.getUserFromGithubApi(userData.body))
                        )
                        .then((prs) =>
                            this.dispatcher.dispatch(
                                new triggers.PullRequestListTrigger(prs)
                            ))
                ).catch((err) => {
                    console.error(err);
                    return this.dispatcher.dispatch(
                        new triggers.PullRequestListTrigger(
                            null, null, (typeof(err) === "string" ?
                            err : "Unexpected error getting pull requests")
                        )
                    );
                })
            )
    ).catch((err) => {
        console.error(err);
        this.dispatcher.dispatch(
            new triggers.PullRequestListTrigger(
                null, null, (err.statusCode === 401 ?
                "Error getting user details - try entering a valid access token"
                : "Unexpected error getting user details")
            )
        );
    });
};

ListController.prototype._loadPulls = function(prs, me) {
    var pulls = {
        owned: {
            unassigned: [],
            awaitingReview: [],
            awaitingAction: [],
            reviewed: [],
            lgtmed: []
        },
        assigned: {
            needsAction: [],
            othersInvolved: [],
            noAction: []
        },
        mentioned: {
            all: []
        }
    };
    for (var i = 0; i < prs.length; ++i) {
        var pr = prs[i];
        if (me.equals(pr.getOwner())) {
            if (!pr.getAssignee()) {
                pulls.owned.unassigned.push(pr);
            }
            else if (pr.getActions().length === 0 && !this._hasCommenterOtherThan(pr, me)) {
                pulls.owned.awaitingReview.push(pr);
            }
            else if (pr.getActionsToDo().length > 0) {
                pulls.owned.awaitingAction.push(pr);
            }
            else if (pr.isLGTM()) {
                pulls.owned.lgtmed.push(pr);
            }
            else {
                pulls.owned.reviewed.push(pr);
            }
        }
        else if (me.equals(pr.getAssignee())) {
            if (pr.getOwner().equals(pr.getLastCommenter()) && pr.getActionsToDo().length === 0) {
                pulls.assigned.needsAction.push(pr);
            }
            else if (!me.equals(pr.getLastCommenter())) {
                pulls.assigned.othersInvolved.push(pr);
            }
            else {
                pulls.assigned.noAction.push(pr);
            }
        }
        else {
            pulls.mentioned.all.push(pr);
        }
    }
    return pulls;
};

ListController.prototype._fillComments = function(searchData) {
    var body = searchData.body;

    var prPromises = [];
    var lineCommentPromises = [];

    for (let i = 0; i < body.total_count; ++i) {
        var item = body.items[i];

        // https://github.com/who/what/pull/37
        var pathParts = item.html_url.split("/");
        if (pathParts.length < 4) {
            throw "Error interpreting pull request URL: " + item.html_url;
        }
        var repo = pathParts[pathParts.length - 4] + "/" + pathParts[pathParts.length - 3];
        var pr = pathParts[pathParts.length - 1];
        prPromises.push(this.controller.retrievePullRequest(repo, pr, false));
        lineCommentPromises.push(this.httpApi.getLineComments(repo, pr));
    }
    return Promise.join(
        Promise.all(prPromises),
        Promise.all(lineCommentPromises),
        (prs, lineComments) => {
            for (let i = 0; i < prs.length; ++i) {
                prs[i].setLineComments(
                    apiMapper.getLineCommentsFromGithubApi(lineComments[i].body)
                );
            }
            return prs;
        }
    );
};

// Returns whether a PR has a commenter other than who.
ListController.prototype._hasCommenterOtherThan = function(pr, who) {
    for (var i = 0; i < pr.getComments().length; ++i) {
        if (!who.equals(pr.getComments()[i].getUser())) {
            return true;
        }
    }
    return false;
};

module.exports = ListController;
