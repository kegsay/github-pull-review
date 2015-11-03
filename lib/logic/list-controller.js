"use strict";
var actions = require("./actions");
var Promise = require("bluebird");
var apiMapper = require("./api-mapper");

function ListController(dispatcher, httpApi, controller) {
    this.dispatcher = dispatcher;
    this.httpApi = httpApi;
    this.controller = controller;
}

ListController.prototype.getOpenPullRequests = function() {
    var self = this;
    Promise.try(() =>
        self.httpApi.getUser()
            .then((userData) =>
                Promise.try(() =>
                    Promise.join(
                        self.httpApi.getOpenPullRequests(userData.body.login, "author")
                            .then((prs) => self._fillComments(prs))
                            .then(self._loadMyPulls),

                        self.httpApi.getOpenPullRequests(userData.body.login, "assignee")
                            .then((prs) => self._fillComments(prs))
                            .then(self._loadAssignedPulls),

                        (myPRs, assignedPRs) =>
                            self.dispatcher.dispatch(actions.create("pr_list", {
                                myPulls: myPRs,
                                assignedPulls: assignedPRs,
                                error: ""
                            }))
                    )
                ).catch((err) => {
                    console.error(err);
                    return self.dispatcher.dispatch(actions.create("pr_list", {
                        myPulls: null,
                        assignedPulls: null,
                        error: typeof(err) === "string" ?
                            err : "Unexpected error getting pull requests"
                    }));
                })
            )
    ).catch((err) => {
        console.error(err);
        self.dispatcher.dispatch(actions.create("pr_list", {
            myPulls: null,
            assignedPulls: null,
            error: err.statusCode === 401 ?
                "Error getting user details - try entering a valid access token"
                : "Unexpected error getting user details"
        }));
    });
};

ListController.prototype._loadMyPulls = function(prs) {
    var pulls = {
        unassigned: [],
        awaitingReview: [],
        awaitingAction: [],
        reviewed: [],
        lgtmed: []
    };
    for (var i = 0; i < prs.length; ++i) {
        var pr = prs[i];
        if (!pr.getAssignee()) {
            pulls.unassigned.push(pr);
        }
        else if (pr.getComments().length <= 1 && pr.getActions().length === 0) {
            // Allow 1 comment because creating the PR leaves a comment
            pulls.awaitingReview.push(pr);
        }
        else if (pr.getActionsToDo().length > 0) {
            pulls.awaitingAction.push(pr);
        }
        else if (pr.isLGTM()) {
            pulls.lgtmed.push(pr);
        }
        else {
            pulls.reviewed.push(pr);
        }
    }
    return pulls;
};

ListController.prototype._loadAssignedPulls = function(prs) {
    var assignedPulls = {
        assignedNeedsAction: [],
        assignedOthersInvolved: [],
        assignedNoAction: []
    };
    for (var i = 0; i < prs.length; ++i) {
        var pr = prs[i];
        var me = pr.getAssignee();
        if (pr.getOwner() === me) {
            // PR will appear in my pulls, don't duplicate it in assigned pulls
            continue;
        }
        else if (pr.getLastCommenter() === pr.getOwner()) {
            assignedPulls.assignedNeedsAction.push(pr);
        }
        else if (pr.getLastCommenter() !== me) {
            assignedPulls.assignedOthersInvolved.push(pr);
        }
        else {
             assignedPulls.assignedNoAction.push(pr);
        }
    }
    return assignedPulls;
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

module.exports = ListController;
