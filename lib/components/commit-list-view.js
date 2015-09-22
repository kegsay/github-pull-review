"use strict";
var CommitView = require("./commit-view");

module.exports = React.createClass({displayName: 'CommitListView',

    render: function() {
        if (!this.props.commits || this.props.commits.length === 0) {
            return (
                <div>
                    No commits yet.
                </div>
            );
        }
        return (
            <div>
                <div>
                {this.props.commits.map(function(commit) {
                    return (
                        <CommitView commit={commit} />
                    );
                })}
                </div>
            </div>
        );
    }
});
