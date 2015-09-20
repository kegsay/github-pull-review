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
                <div className="CommentView_header">
                    <a href={comment.by_url} target="_blank">{comment.by}</a> commented
                </div>
                <div className="CommentView_body">
                    {comment.body}
                </div>
            </div>
        );
    }
});
