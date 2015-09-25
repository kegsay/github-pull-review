var PatchView = require("./patch-view");

module.exports = React.createClass({displayName: 'FileDiffView',

    getInitialState: function() {
        return {
            visible: true
        };
    },

    toggleVisible: function() {
        this.setState({
            visible: !this.state.visible
        });
    },

    render: function() {
        var diff = this.props.diff;
        var visibleText = this.state.visible ? "Hide" : "Show";
        var patchElement, visibilityButton;

        if (this.state.visible) {
            patchElement = <PatchView patch={diff.getPatch()} />;
        }

        if (diff.getPatch()) {
            visibilityButton = (
                <button className="FileDiffView_show_hide_button"
                    onClick={this.toggleVisible}>
                    {visibleText}
                </button>
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
                    <div className="FileDiffView_header_counts">
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
