var PatchView = require("./patch-view");

module.exports = React.createClass({displayName: 'FileDiffView',

    getInitialState: function() {
        return {
            visible: true,
            unified: false
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

    render: function() {
        var diff = this.props.diff;
        var visibleText = this.state.visible ? "Hide" : "Show";
        var unifyText = this.state.unified ? "Side-by-Side" : "Unified";
        var patchElement, visibilityButton, patchButton;

        if (this.state.visible) {
            patchElement = (
                <PatchView patch={diff.getPatch()} unified={this.state.unified}/>
            );
        }

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
        if (this.props.comments.length > 0) {
            commentCount = (
                <span className="FileDiffView_counts_comments">
                    {this.props.comments.length} comments
                </span>
            );
        }
        this.props.comments.forEach(function(c) {
            console.log("%s SHA: %s  Comment: %s Line: %s",
                c.getFilePath(), c.sha, c.getComment().getBody(),
                c.patch.getLastLine().getRawLine());
        })

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
                {patchElement}
            </div>
        );
    }
});
