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

        var htmlBody = comment.getHtmlBody();

        if (/<\/blockquote>$/.test(htmlBody)) {
            // TODO ends in a block quote, hide it behind a toggle button.
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
                    dangerouslySetInnerHTML={{__html: htmlBody}}>
                </div>
            </div>
        );
    }
});
