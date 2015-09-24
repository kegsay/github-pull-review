module.exports = React.createClass({displayName: 'PatchView',

    render: function() {
        var patch = this.props.patch;
        if (!patch) {
            return (
                <div> No patch yet. </div>
            );
        }

        return (
            <div className="PatchView">
                <pre>
                    {patch.getRaw()}
                </pre>
            </div>
        );
    }
});
