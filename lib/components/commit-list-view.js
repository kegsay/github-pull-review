"use strict";
var React = require("react");
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
                {this.props.commits.map(function(commit, i) {
                    return (
                        <CommitView commit={commit} key={i}/>
                    );
                })}
                </div>
            </div>
        );
    }
});
