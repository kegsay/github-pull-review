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
                <div className="CommentView_header">
                    <a href={comment.by_url} target="_blank">{comment.by}</a> commented
                </div>
                <div className="CommentView_body"
                    dangerouslySetInnerHTML={{__html: markdownHtml}}>
                </div>
            </div>
        );
    }
});
