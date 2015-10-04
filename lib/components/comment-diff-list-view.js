"use strict";
var PatchView = require("./patch-view");
var CommentView = require("./comment-view");
var Patch = require("../logic/models/patch");
var Comment = require("../logic/models/comment");

module.exports = React.createClass({displayName: 'CommentDiffListView',
    propTypes: {
        patch: React.PropTypes.instanceOf(Patch).isRequired,
        comments: React.PropTypes.array.isRequired,
        numLines: React.PropTypes.number
    },

    getDefaultProps: function() {
        return {
            numLines: 5
        };
    },

    render: function() {
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
                {this.props.comments.map(function(cmt) {
                    return (
                        <CommentView
                            comment={cmt} />
                    );
                })}
            </div>
        );
    }
});
