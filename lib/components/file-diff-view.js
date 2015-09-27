var PatchView = require("./patch-view");
var CommentView = require("./comment-view");

module.exports = React.createClass({displayName: 'FileDiffView',

    getInitialState: function() {
        return {
            visible: true,
            unified: false,
            from: "BASE",
            to: "HEAD",
            showAllComments: false
        };
    },

    toggleVisible: function() {
        this.setState({
            visible: !this.state.visible
        });
    },

    toggleUnified: function() {
        this.setState({
            unified: !this.state.unified
        });
    },

    toggleAllComments: function() {
        this.setState({
            showAllComments: !this.state.showAllComments
        });
    },

    render: function() {
        var diff = this.props.diff;
        var pr = this.props.pr;
        var visibleText = this.state.visible ? "Hide" : "Show";
        var unifyText = this.state.unified ? "Side-by-Side" : "Unified";
        var otherCommentsText = this.state.showAllComments ? "Hide all comments" : "Show all comments";
        var patchElement, visibilityButton, patchButton, otherCommentsButton, allCommentsElement;

        if (diff.getPatch()) {
            visibilityButton = (
                <button className="FileDiffView_show_hide_button"
                    onClick={this.toggleVisible}>
                    {visibleText}
                </button>
            );
            patchButton = (
                <button className="FileDiffView_unify_button"
                    onClick={this.toggleUnified}>
                    {unifyText}
                </button>
            );
        }

        var commentCount;
        var headComments = [];
        if (this.props.comments.length > 0) {
            headComments = this.props.comments.filter(function(c) {
                return c.getSha() === pr.getHeadSha();
            });

            commentCount = (
                <span className="FileDiffView_counts_comments">
                    {headComments.length} comments ({this.props.comments.length} total)
                </span>
            );

            if (headComments.length < this.props.comments.length) {
                otherCommentsButton = (
                    <button className="FileDiffView_all_comments_button"
                        onClick={this.toggleAllComments}>
                        {otherCommentsText}
                    </button>
                );
            }
        }
        this.props.comments.forEach(function(c) {
            console.log("%s BASE: %s HEAD: %s comment SHA: %s  Comment: %s Line: %s",
                c.getFilePath(), pr.getBaseSha(), pr.getHeadSha(), c.sha, c.getComment().getBody(),
                c.patch.getLastLine().getRawLine());
        });

        if(this.state.showAllComments) {
            allCommentsElement = (
                <div className="FileDiffView_all_comments">
                    {this.props.comments.map(function(cmt, i) {
                        if (cmt.getSha() === pr.getHeadSha()) { return; }
                        return (
                            <CommentView comment={cmt} key={i} />
                        );
                    })}
                </div>
            );
        }

        if (this.state.visible) {
            patchElement = (
                <PatchView patch={diff.getPatch()} unified={this.state.unified} comments={headComments}/>
            );
        }

        return (
            <div className="FileDiffView">
                <div className="FileDiffView_header">
                    <span
                        className={
                            "FileDiffView_header_status " +
                            "FileDiffView_header_status_" + diff.getStatus()
                        }>
                        {diff.getStatusString()}
                    </span>
                    <span className="FileDiffView_header_path">
                        {diff.getFilePathString()}
                    </span>
                    {visibilityButton}
                    {patchButton}
                    <div className="FileDiffView_header_counts">
                        {otherCommentsButton}
                        {commentCount}
                        <span className="FileDiffView_counts_additions">
                            {diff.getAddCount()}++
                        </span>
                        <span className="FileDiffView_counts_deletions">
                            {diff.getRemoveCount()}--
                        </span>
                        <span className="FileDiffView_counts_changes">
                            {diff.getChangeCount()}
                        </span>
                    </div>
                </div>
                {allCommentsElement}
                {patchElement}
            </div>
        );
    }
});
