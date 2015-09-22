var marked = require("marked");
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

function timeSince(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
    var interval = Math.floor(seconds / 31536000);
    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

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

        // convert GFM to HTML
        var markdownHtml = marked(comment.body);

        return (
            <div className="CommentView">
                <img className="CommentView_avatar" src={comment.avatar} />
                <div className="CommentView_header">
                    <a href={comment.by_url} target="_blank">
                        {comment.by}
                    </a> commented {timeSince(comment.ts)} ago
                </div>
                <div className="CommentView_body"
                    dangerouslySetInnerHTML={{__html: markdownHtml}}>
                </div>
            </div>
        );
    }
});
