var React = require("react");
var CommentView = require("./comment-view");
var CommentBox = require("./comment-box");
var Promise = require("bluebird");

module.exports = React.createClass({displayName: 'CommentListView',
    propTypes: {
        comments: React.PropTypes.array.isRequired,
        showCommentBox: React.PropTypes.bool.isRequired,
        onSubmitComment: React.PropTypes.func
    },

    getDefaultProps: function() {
        return {
            onSubmitComment: function(text) {
                console.log("onSubmitComment: " + text);
                return Promise.reject("No onSubmitComment provided");
            },
            showCommentBox: false,
            comments: []
        };
    },

    onSubmitComment: function(text) {
        return this.props.onSubmitComment(text);
    },

    render: function() {
        if (this.props.comments.length === 0) {
            return (
                <div>
                    No comments yet.
                </div>
            );
        }
        var commentBox;
        if (this.props.showCommentBox) {
            commentBox = <CommentBox onSubmit={this.onSubmitComment} />;
        }
        return (
            <div>
                <div>
                {this.props.comments.map(function(comment, i) {
                    return (
                        <CommentView comment={comment} key={i}/>
                    );
                })}
                </div>
                {commentBox}
            </div>
        );

    }
});
