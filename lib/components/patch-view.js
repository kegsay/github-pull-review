module.exports = React.createClass({displayName: 'PatchView',

    render: function() {
        var patch = this.props.patch;
        var unified = this.props.unified;
        if (!patch) {
            // possible for renamed files with no diffs.
            return (
                <div> </div>
            );
        }

        return (
            <div className="PatchView">
                {unified ? patch.getUnifiedDiffJsx() : patch.getSideBySideDiffJsx()}
            </div>
        );
    }
});
