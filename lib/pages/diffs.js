import {PullRequestTrigger, FileDiffsTrigger, LineCommentsTrigger} from "../logic/triggers";
var TriggerMixin = require("../logic/triggers").TriggerMixin([
    PullRequestTrigger, FileDiffsTrigger, LineCommentsTrigger
]);
var React = require("react");
var FileDiffListView = require("../components/file-diff-list-view");

function extractAnchorFromHash() {
    var hashParts = window.location.hash.split('#');
    if (hashParts <= 2) {
        // Sometimes a URL like #/foo#bar will be encoded as #/foo%23bar
        hashParts = window.decodeURIComponent(window.location.hash).split("#");
    }
    if (hashParts.length > 2) {
        return hashParts.slice(-1)[0];
    }
    return null;
}

function setHash(val) {
    var hashParts = window.location.hash.split("#");
    if (hashParts.length === 2) {
        // no fragment currently
        window.location.hash = window.location.hash + "#" + val;
    }
    else if (hashParts.length === 3) {
        // already has a fragment, clobber it.
        hashParts[2] = val;
        window.location.hash = hashParts.join("#");
    }
    else {
        console.error("Unexpected hash parts: %s", hashParts);
    }
}

module.exports = React.createClass({displayName: 'DiffsPage',
    mixins: [TriggerMixin],

    propTypes: {
        controller: React.PropTypes.any.isRequired
    },

    componentWillMount: function() {
        this.setState({
            anchorId: extractAnchorFromHash()
        });
    },

    // navigating first mount
    componentDidMount: function() {
        this._loadDiffs(this.props);
    },

    // navigating once mounted
    componentWillReceiveProps: function(newProps) {
        this._loadDiffs(newProps);
    },

    _loadDiffs: function(props) {
        // set the pr if we already know it.
        var pullRequest = this.props.controller.getPullRequest();
        if (pullRequest) {
            this.setTrigger(new PullRequestTrigger(pullRequest));
        }
        var ownerRepo = props.params.owner + "/" + props.params.repo;
        var pr = props.params.pr;
        this.props.controller.getRequestDiffs(ownerRepo, pr, false);
    },

    onSubmitReplyToComment: function(path, lineComment, text) {
        return this.props.controller.postReplyLineComment(
            this.getTrigger(PullRequestTrigger).pr, text, lineComment
        );
    },

    onSubmitLineComment: function(path, pos, text) {
        return this.props.controller.postLineComment(
            this.getTrigger(PullRequestTrigger).pr, text, path, pos
        );
    },

    _onFileLineClick: function(diff, lineId, line) {
        setHash(lineId);
    },

    _onFileCommentClick: function(diff, comment, anchorId) {
        setHash(anchorId);
    },

    render: function() {
        var pr = this.getTrigger(PullRequestTrigger).pr;
        if (!pr) {
            return <div>Loading pull request...</div>;
        }
        var fileDiffs = this.getTrigger(FileDiffsTrigger).files || [];
        var lineComments = this.getTrigger(LineCommentsTrigger).comments || [];
        return (
            <FileDiffListView diffs={fileDiffs} comments={lineComments} pr={pr}
                onReplyToComment={this.onSubmitReplyToComment}
                onLineComment={this.onSubmitLineComment}
                controller={this.props.controller}
                onFileLineClick={this._onFileLineClick}
                onFileCommentClick={this._onFileCommentClick}
                anchorId={this.state.anchorId} />
        );
    }
});
