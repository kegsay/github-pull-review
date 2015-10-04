"use strict";
var LineComment = require("../logic/models/line-comment");

module.exports = React.createClass({displayName: 'CommentView',
    propTypes: {
        onToggleCommits: React.PropTypes.func,
        comment: React.PropTypes.any.isRequired
    },

    getDefaultProps: function() {
        return {
            onToggleCommits: function() {}
        };
    },

    _onToggleCommits: function(wantEarlierCommits) {
        this.props.onToggleCommits(wantEarlierCommits);
    },

    render: function() {
        var comment = this.props.comment;
        if (!comment) {
            return (
                <div>
                    No comment.
                </div>
            );
        }
        var lineCommentHeader;
        if (comment instanceof LineComment) {
            lineCommentHeader = (
                <span>
                    ({comment.getShortSha()})
                    <input type="image" src="base2cmt.png" className="CommentView_commitToggle"
                        title="View diff when this comment was made"
                        onClick={this._onToggleCommits.bind(this, true)} />
                    <input type="image" src="cmt2head.png" className="CommentView_commitToggle"
                        title="View diff after this comment was made"
                        onClick={this._onToggleCommits.bind(this, false)} />
                </span>
            );
            comment = comment.getComment();
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
                    } ago <a href={comment.getLink()} target="_blank">(Source)</a>
                    {lineCommentHeader}
                </div>
                <div className="CommentView_body"
                    dangerouslySetInnerHTML={{__html: htmlBody}}>
                </div>
            </div>
        );
    }
});
