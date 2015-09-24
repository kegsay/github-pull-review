module.exports = React.createClass({displayName: 'PatchView',

    render: function() {
        var patch = this.props.patch;
        if (!patch) {
            // possible for renamed files with no diffs.
            return (
                <div> </div>
            );
        }

        return (
            <div className="PatchView">
                {patch.getUnifiedDiffJsx()}
            </div>
        );
    }
});
