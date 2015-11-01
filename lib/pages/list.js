"use strict";
var Promise = require("bluebird");
var React = require("react");
var Link = require("react-router").Link;
var apiMapper = require("../logic/api-mapper");

// Keys in state.pulls
const unassignedKey = "unassigned";
const awaitingReviewKey = "awaitingReview";
const awaitingActionKey = "awaitingAction";
const reviewedKey = "reviewed";
const lgtmedKey = "lgtmed";

// Keys in state.assignedPulls
const assignedNoActionKey = "assignedNoAction";
const assignedNeedsActionKey = "assignedNeedsAction";
const assignedOthersInvolvedKey = "assignedOthersInvolvedAction";

// States
const unloaded = "unloaded";
const loading = "loading";
const loaded = "loaded";

// Values of _renderPRs's display param
const displayOwner = "displayOwner";

module.exports = React.createClass({displayName: 'ListPage',
    propTypes: {
        controller: React.PropTypes.any,
        sessionStore: React.PropTypes.any
    },

    getInitialState: function() {
        return {
            pulls: {},
            assignedPulls: {},
            pullsState: unloaded,
            assignedPullsState: unloaded,
            error: null
        };
    },

    loadPulls: function() {
        var self = this;
        this.setState({
            pullsState: loading,
            assignedPullsState: loading
        });
        var self = this;
        var userPromise = Promise.try(function() {
            return self.props.controller.httpApi.getUser();
        }).catch(function(err) {
            if (err.statusCode == 401) {
                self.setState({error: "Error getting user details - try entering a valid access token"});
            } else {
                self.setState({error: "Unexpected error getting user details"});
            }
            return Promise.reject(err);
        });

        userPromise
            .then(function(userData) { return self.props.controller.httpApi.getOpenPullRequests(userData.body.login, "author"); })
            .then(this._fillComments)
            .then(this._loadMyPulls)
            .catch(function(err) {
                console.log(err)
            });

        userPromise
            .then(function(userData) { return self.props.controller.httpApi.getOpenPullRequests(userData.body.login, "assignee"); })
            .then(this._fillComments)
            .then(this._loadAssignedPulls)
            .catch(function(err) {
                console.log(err);
            });
    },

    _loadMyPulls: function(prs) {
        var pulls = {};
        pulls[unassignedKey] = [];
        pulls[awaitingReviewKey] = [];
        pulls[awaitingActionKey] = [];
        pulls[reviewedKey] = [];
        pulls[lgtmedKey] = [];
        for (var i = 0; i < prs.length; ++i) {
            var pr = prs[i];
            if (!pr.getAssignee()) {
                pulls[unassignedKey].push(pr);
            } else if (pr.getComments().length <= 1 && pr.getActions().length === 0) { // 1 because creating the PR leaves a comment
                pulls[awaitingReviewKey].push(pr);
            } else if (pr.getActionsToDo().length > 0) {
                pulls[awaitingActionKey].push(pr);
            } else if (pr.isLGTM()) {
                pulls[lgtmedKey].push(pr);
            } else {
                pulls[reviewedKey].push(pr);
            }
        }
        this.setState({
            pulls: pulls,
            pullsState: loaded
        });
    },

    _loadAssignedPulls: function(prs) {
        var assignedPulls = {};
        assignedPulls[assignedNeedsActionKey] = [];
        assignedPulls[assignedOthersInvolvedKey] = [];
        assignedPulls[assignedNoActionKey] = [];
        for (var i = 0; i < prs.length; ++i) {
            var pr = prs[i];
            var me = pr.getAssignee();
            if (pr.getOwner() === me) {
                continue;
            } else if (pr.getLastCommenter() === pr.getOwner()) {
                assignedPulls[assignedNeedsActionKey].push(pr);
            } else if (pr.getLastCommenter() !== me) {
                assignedPulls[assignedOthersInvolvedKey].push(pr);
            } else {
                 assignedPulls[assignedNoActionKey].push(pr);
            }
        }
        this.setState({
            assignedPulls: assignedPulls,
            assignedPullsState: loaded
        });
    },

    _fillComments: function(searchData) {
        var body = searchData.body

        var prs = [];
        var lineComments = [];

        for (var i = 0; i < body.total_count; ++i) {
            var item = body.items[i];

            // https://github.com/who/what/pull/37
            var pathParts = item.html_url.split("/");
            if (pathParts.length < 4) {
                this.setState({error: "Error interpreting pull request URL: " + item.html_url});
            }
            var repo = pathParts[pathParts.length - 4] + "/" + pathParts[pathParts.length - 3];
            var pr = pathParts[pathParts.length - 1];
            prs.push(this.props.controller.retrievePullRequest(repo, pr, false));
            lineComments.push(this.props.controller.httpApi.getLineComments(repo, pr));
        }
        return Promise.join(Promise.all(prs), Promise.all(lineComments), function(prs, lineComments) {
            for (var i = 0; i < prs.length; ++i) {
                prs[i].setLineComments(apiMapper.getLineCommentsFromGithubApi(lineComments[i].body));
            }
            return prs;
        });
    },

    render: function() {
        if (this.state.error) {
            return (<div>Error: {this.state.error}</div>);
        }
        if (this.state.pullsState === loaded && this.state.assignedPullsState === loaded) {
            var assigned = [].concat(
                this._renderPRs("Awaiting your review:", this.state.assignedPulls[assignedNeedsActionKey], displayOwner),
                this._renderPRs("Others last commented:", this.state.assignedPulls[assignedOthersInvolvedKey], displayOwner),
                this._renderPRs("Awaiting their action:", this.state.assignedPulls[assignedNoActionKey], displayOwner)
            );
            if (assigned.length === 0) {
                assigned = "None";
            }

            var owned = [].concat(
                this._renderPRs("Awaiting your response:", this.state.pulls[awaitingActionKey]),
                this._renderPRs("Reviewed (but not LGTM):", this.state.pulls[reviewedKey]),
                this._renderPRs("LGTM:", this.state.pulls[lgtmedKey]),
                this._renderPRs("Unassigned:", this.state.pulls[unassignedKey]),
                this._renderPRs("Awaiting review:", this.state.pulls[awaitingReviewKey])
            );
            if (owned.length === 0) {
                owned = "None";
            }

            return (<div>
                <h2>Assigned to you:</h2>
                {assigned}

                <h2>Owned by you:</h2>
                {owned}
            </div>);
        }
        if (this.state.pullsState === unloaded || this.state.assignedPulls === unloaded) {
            this.loadPulls();
        }
        return (<div>Loading...</div>);
    },

    _renderPRs: function(heading, pulls, display) {
        if (!pulls.length) {
            return [];
        }
        return [(<h2>{heading}</h2>), (<ul>{pulls.map(function(pr) {
            var who = (display === displayOwner) ? pr.getOwner() : pr.getAssignee();
            if (who) {
                who = who.getUserLinkJsx();
            } else {
                who = "";
            }
            var repoUrl = "https://github.com/" + pr.getRepo();
            return <li><Link to={`/repos/${pr.getRepo()}/${pr.getId()}`}>{pr.getTitle()}</Link> - <a href={repoUrl} target="_blank">{pr.getRepo()}</a> #{pr.getId()} {who}</li>
        })}</ul>)];
    }
});
