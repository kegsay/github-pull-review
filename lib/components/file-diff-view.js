var PatchView = require("./patch-view");

module.exports = React.createClass({displayName: 'FileDiffView',

    render: function() {
        var diff = this.props.diff;

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
                <PatchView patch={diff.getPatch()} />
            </div>
        );
    }
});
