"use strict";
var React = require("react");
var PatchView = require("./patch-view");
var CommentView = require("./comment-view");
var Patch = require("../logic/models/patch");
var LineComment = require("../logic/models/line-comment");

module.exports = React.createClass({displayName: 'CommentDiffListView',
    propTypes: {
        patch: React.PropTypes.instanceOf(Patch).isRequired,
        comments: React.PropTypes.array.isRequired,
        onToggleCommits: React.PropTypes.func,
        numLines: React.PropTypes.number
    },

    getDefaultProps: function() {
        return {
            numLines: 5,
            onToggleCommits: function() {}
        };
    },

    onToggleCommits: function(cmt, wantEarlierCommits) {
        this.props.onToggleCommits(cmt, wantEarlierCommits);
    },

    render: function() {
        var self = this;
        var patch = this.props.patch;
        if (this.props.patch.getUnifiedData().length > this.props.numLines) {
            patch = new Patch(this.props.patch.getRaw());
            patch.setMaxLines(this.props.numLines);
        }

        return (
            <div className="CommentDiffListView">
                <PatchView
                    showUnified={true}
                    patch={patch}
                    enabledComments={false}
                    comments={[]} />
                {self.props.comments.map(function(cmt) {
                    var key;
                    if (cmt instanceof LineComment) {
                        key = cmt.getComment().getId();
                    }
                    else {
                        key = cmt.getId();
                    }
                    return (
                        <CommentView
                            key={key}
                            comment={cmt}
                            onToggleCommits={self.onToggleCommits.bind(self, cmt)}/>
                    );
                })}
            </div>
        );
    }
});
