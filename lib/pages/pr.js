var React = require("react");
var Link = require("react-router").Link;
var GprHeader = require("../components/gpr-header");
import {PullRequestTrigger} from "../logic/triggers";
var TriggerMixin = require("../logic/triggers").TriggerMixin([
    PullRequestTrigger
]);

module.exports = React.createClass({displayName: 'PullRequestPage',
    mixins: [TriggerMixin],

    // navigating first mount
    componentDidMount: function() {
        this._loadPullRequest(this.props);
    },

    // navigating once mounted
    componentWillReceiveProps: function(newProps) {
        this._loadPullRequest(newProps);
    },

    _loadPullRequest: function(props) {
        var ownerRepo = props.params.owner + "/" + props.params.repo;
        var pr = props.params.pr;

        if (ownerRepo === this.state.ownerRepo && pr === this.state.requestId) {
            console.log("PR already loaded.");
            return;
        }

        props.sessionStore.setRepositoryId(ownerRepo);
        props.sessionStore.setRequestId(pr);

        props.controller.retrievePullRequest(ownerRepo, pr, true);

        console.log("PR mounted => Get PR #%s %s", pr, ownerRepo);
        this.setState({
            ownerRepo: ownerRepo,
            requestId: pr
        });
    },

    render: function() {
        var pr = this.getTrigger(PullRequestTrigger).pr;
        if (!pr || Object.keys(pr).length === 0) {
            return <div>Loading pull request...</div>;
        }
        var pathPrefix = (
            "/repos/" + pr.getRepo() + "/" + pr.getId()
        );
        var intent;
        if (pr.getState() === "merged") {
            intent = (
                <span>
                {pr.getMerger().getUserLinkJsx()} merged
                </span>
            );
        }
        else {
            intent = (
                <span>
                {pr.getOwner().getUserLinkJsx()} wants to merge
                </span>
            );
        }

        var mergeTab = pr.getState() === "closed" ? "Open" : "Merge/Close";

        return (
            <div>
                <GprHeader showBackLink={true} />

                <div className="PullRequestOverview_title">
                    {pr.getTitle()} (
                        <a href={pr.getLink()} target="_blank">
                            #{pr.getId()}
                        </a>
                    )
                </div>
                <div className="PullRequestOverview_status_bar">
                    <span className={
                        "PullRequestOverview_state PullRequestOverview_state_" + pr.getState()
                    }>
                        {pr.getPrettyState()}
                    </span>
                    <span>
                    {intent} {pr.getCommits().length} commits into <span className="inline_code">
                            {pr.getDest().getLabel()}
                        </span> from <span className="inline_code">
                            {pr.getSource().getLabel()}
                        </span>
                    </span>
                </div>
                <div>
                <Link to={`${pathPrefix}/history`} className="PullRequestPage_link">History</Link>
                <Link to={`${pathPrefix}/commits`} className="PullRequestPage_link">Commits</Link>
                <Link to={`${pathPrefix}/diffs`} className="PullRequestPage_link">Diffs</Link>
                <Link to={`${pathPrefix}/actions`} className="PullRequestPage_link">Actions</Link>
                <Link to={`${pathPrefix}/merge`} className="MergePage_link">{mergeTab}</Link>
                </div>
                {this.props.children}
            </div>
        );
    }
});
