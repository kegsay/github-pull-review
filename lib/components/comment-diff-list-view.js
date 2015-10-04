"use strict";
var PatchView = require("./patch-view");
var CommentView = require("./comment-view");
var Patch = require("../logic/models/patch");
var Comment = require("../logic/models/comment");

module.exports = React.createClass({displayName: 'CommentDiffListView',
    propTypes: {
        patch: React.PropTypes.instanceOf(Patch).isRequired,
        comments: React.PropTypes.array.isRequired
    },

    render: function() {
        return (
            <div>
                <PatchView
                    showUnified={true}
                    patch={this.props.patch}
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
