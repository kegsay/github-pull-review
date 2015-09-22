"use strict";

module.exports = React.createClass({displayName: 'CommentView',

    render: function() {
        var comment = this.props.comment;
        if (!comment) {
            return (
                <div>
                    No comment.
                </div>
            );
        }

        return (
            <div className="CommentView">
                <img className="CommentView_avatar" src={
                    comment.getUser().getAvatarUrl()
                } />
                <div className="CommentView_header">
                    {comment.getUser().getUserLinkJsx()} commented {
                        comment.getTimeAgo()
                    } ago
                </div>
                <div className="CommentView_body"
                    dangerouslySetInnerHTML={{__html: comment.getHtmlBody()}}>
                </div>
            </div>
        );
    }
});
