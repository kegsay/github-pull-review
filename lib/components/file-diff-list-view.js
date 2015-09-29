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
        var self = this;
        var comments = this.props.comments || [];

        return (
            <div>
                <div>
                {this.props.diffs.map(function(diff, i) {
                    var fileComments = comments.filter(function(cmt) {
                        return cmt.getFilePath() === diff.getFilePath();
                    });
                    return (
                        <FileDiffView diff={diff} comments={fileComments}
                            pr={self.props.pr} key={i} />
                    );
                })}
                </div>
            </div>
        );
    }
});
