var React = require("react");
var TriggerMixin = require("../logic/triggers").TriggerMixin([
    "pr_info"
]);
var CommitListView = require("../components/commit-list-view");

module.exports = React.createClass({displayName: 'CommitsPage',
    mixins: [TriggerMixin],

    componentDidMount: function() {
        this.setState({
            pr_info: {
                pr: this.props.controller.getPullRequest()
            }
        });
    },

    render: function() {
        var pr = this.state.pr_info.pr;
        if (!pr) {
            return <div>Loading pull request...</div>;
        }
        return (
            <CommitListView commits={pr.getCommits()}
                        repo={pr.getRepo()} req={pr.getId()} />
        );
    }
});
