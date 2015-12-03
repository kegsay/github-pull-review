import {PullRequestListTrigger} from "../logic/triggers";
var TriggerMixin = require("../logic/triggers").TriggerMixin([
    PullRequestListTrigger
]);
var React = require("react");
var Link = require("react-router").Link;
var PrSearcher = require("../components/pr-searcher");

// Values of _renderPRs's display param
const displayOwner = "displayOwner";

module.exports = React.createClass({displayName: 'ListPage',
    mixins: [TriggerMixin],

    componentDidMount: function() {
        if (!this.props.sessionStore.getAccessToken()) {
            this.props.history.pushState(null, "/");
        }
    },

    propTypes: {
        controller: React.PropTypes.any.isRequired,
        listController: React.PropTypes.any,
        sessionStore: React.PropTypes.any
    },

    render: function() {
        var prList = this.getTrigger(PullRequestListTrigger);
        if (!prList || Object.keys(prList).length === 0) {
            this.props.listController.getOpenPullRequests();
            return (<div>Loading...</div>);
        }
        if (prList.error) {
            return (<div>Error: {prList.error}</div>);
        }

        var assigned = [].concat(
            this._renderPRs(
                "Awaiting your review:",
                prList.assignedPulls.assignedNeedsAction,
                displayOwner
            ),
            this._renderPRs(
                "Others last commented:",
                prList.assignedPulls.assignedOthersInvolved,
                displayOwner
            ),
            this._renderPRs(
                "Awaiting their action:",
                prList.assignedPulls.assignedNoAction,
                displayOwner
            )
        );
        if (assigned.length === 0) {
            assigned = "None";
        }

        var owned = [].concat(
            this._renderPRs("Awaiting your response:", prList.myPulls.awaitingAction),
            this._renderPRs("Reviewed (but not LGTM):", prList.myPulls.reviewed),
            this._renderPRs("LGTM:", prList.myPulls.lgtmed),
            this._renderPRs("Unassigned:", prList.myPulls.unassigned),
            this._renderPRs("Awaiting review:", prList.myPulls.awaitingReview)
        );
        if (owned.length === 0) {
            owned = "None";
        }

        return (<div>
            <h2>Assigned to you:</h2>
            {assigned}

            <h2>Owned by you:</h2>
            {owned}
        <PrSearcher controller={this.props.controller} history={this.props.history} />
        </div>);
    },

    _renderPRs: function(heading, pulls, display) {
        if (!pulls.length) {
            return [];
        }
        return [
            (<h2 key={`h2-${heading}`}>{heading}</h2>),
            (<ul key={`ul-${heading}`}>{pulls.map(function(pr) {
            var keySuffix = "pr-" + pr.getRepo() + "/" + pr.getId();
            var who = (display === displayOwner) ? pr.getOwner() : pr.getAssignee();
            if (who) {
                who = who.getUserLinkJsx("user-" + keySuffix);
            }
            else {
                who = "";
            }
            var repoUrl = "https://github.com/" + pr.getRepo();
            return (
                <li key={`li-${keySuffix}`}>
                    <Link to={`/repos/${pr.getRepo()}/${pr.getId()}`} key={`link-${keySuffix}`}>
                    {pr.getTitle()}
                    </Link> - <a href={repoUrl} target="_blank" key={`a-${keySuffix}`}>
                    {pr.getRepo()}
                    </a> <a href={`${repoUrl}/pull/${pr.getId()}`} key={`a2-${keySuffix}`}>
                    #{pr.getId()}
                    </a> {who}
                </li>
            );
        })}</ul>)];
    }
});
