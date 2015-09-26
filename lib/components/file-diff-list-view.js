var FileDiffView = require("./file-diff-view");

module.exports = React.createClass({displayName: 'FileDiffListView',

    render: function() {
        if (!this.props.diffs || this.props.diffs.length === 0) {
            return (
                <div>
                    No diffs yet.
                </div>
            );
        }
        return (
            <div>
                <div>
                {this.props.diffs.map(function(diff, i) {
                    return (
                        <FileDiffView diff={diff} key={i} />
                    );
                })}
                </div>
            </div>
        );
    }
});
