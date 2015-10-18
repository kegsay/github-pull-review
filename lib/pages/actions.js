var React = require("react");
var CommentView = require("../components/comment-view");
var CommentDiffListView = require("../components/comment-diff-list-view");
var Actions = require("../logic/models/action");
var dispatcher = require("../logic/dispatcher");
var actions = require("../logic/actions");
var ActionMixin = require("../logic/actions").ActionMixin([
    "pr_info", "file_diffs", "line_comments"
]);

module.exports = React.createClass({displayName: 'ActionsPage',
    mixins: [ActionMixin],

    getInitialState: function() {
        return {
            actions: null,
            expanded: {}
        };
    },

    // navigating first mount
    componentDidMount: function() {
        this._loadDiffs(this.props);
    },

    // navigating once mounted
    componentWillReceiveProps: function(newProps) {
        this._loadDiffs(newProps);
    },

    componentDidUpdate: function() {
        if (this.state.actions) {
            return;
        }
        if (this.state.line_comments && this.state.line_comments.comments) {
            this.setState({
                actions: Actions.fromLineComments(this.state.line_comments.comments)
            });
        }
    },

    _loadDiffs: function(props) {
        // set the pr if we already know it.
        var pullRequest = this.props.controller.getPullRequest();
        if (pullRequest) {
            this.setState({
                pr_info: {
                    pr: pullRequest
                }
            });
        }
        var ownerRepo = props.params.owner + "/" + props.params.repo;
        var pr = props.params.pr;
        this.props.controller.getRequestDiffs(ownerRepo, pr, false);
    },

    toggleExpand: function(actionId) {
        var expanded = this.state.expanded;
        if (expanded[actionId] === undefined) {
            expanded[actionId] = false;
        }
        expanded[actionId] = !expanded[actionId];
        this.setState({
            expanded: expanded
        })
    },

    getActionHeaderJsx: function(action, id) {
        var expandText = this.state.expanded[id] ? "Collapse" : "Expand";
        return (
            <div>
                <span>{action.getHeadComment().getFilePath()}</span>
                <button onClick={this.toggleExpand.bind(this, id)}> {expandText} </button>
            </div>
        );
    },

    getActionJsx: function(action, index, isDone) {
        var id = isDone ? ("d" + index) : ("n" + index);
        var body;
        if (this.state.expanded[id]) {
            body = (
                <CommentDiffListView
                    patch={action.getHeadComment().getPatch()}
                    comments={action.getComments()} />
            );
        }
        else {
            body = (
                <CommentView key={index} comment={action.getHeadComment()} />
            );
        }
        return (
            <div>
                {this.getActionHeaderJsx(action, id)}
                {body}
            </div>
        );
    },

    render: function() {
        var self = this;
        var pr = this.state.pr_info.pr;
        if (!pr || !this.state.actions) {
            return <div>Loading pull request...</div>;
        }
        // var fileDiffs = this.state.file_diffs ? this.state.file_diffs.files : [];

        var notDones = this.state.actions.filter(function(a) { return !a.isDone(); });
        var dones = this.state.actions.filter(function(a) { return a.isDone(); });

        return (
            <div>
                <h2>Outstanding Line Comments</h2>
                {notDones.map(function(action, i) {
                    return self.getActionJsx(action, i, false);
                })}
                <h2>Completed Line Comments</h2>
                {dones.map(function(action, i) {
                    return self.getActionJsx(action, i, true);
                })}
            </div>
        );
    }
});
