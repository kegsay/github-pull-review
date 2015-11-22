import {PullRequestTrigger} from "../logic/triggers";
var React = require("react");
var TriggerMixin = require("../logic/triggers").TriggerMixin([
    PullRequestTrigger
]);
var CommitListView = require("../components/commit-list-view");

module.exports = React.createClass({displayName: 'CommitsPage',
    mixins: [TriggerMixin],

    componentDidMount: function() {
        this.setTrigger(
            new PullRequestTrigger(this.props.controller.getPullRequest())
        );
    },

    render: function() {
        var pr = this.getTrigger(PullRequestTrigger).pr;
        if (!pr) {
            return <div>Loading pull request...</div>;
        }
        return (
            <CommitListView commits={pr.getCommits()}
                        repo={pr.getRepo()} req={pr.getId()} />
        );
    }
});
