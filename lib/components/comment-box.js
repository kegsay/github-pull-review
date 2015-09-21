var dispatcher = require("../logic/dispatcher");
var actions = require("../logic/actions");
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


module.exports = React.createClass({displayName: 'CommentBox',

    getInitialState: function() {
        return {
            view: "write",
            txt: ""
        };
    },

    onWrite: function() {
        this.setState({ view: "write" });
    },

    onPreview: function() {
        this.setState({ view: "preview" });
    },

    onSubmit: function() {
        dispatcher.dispatch(actions.create("post_comment", {
            text: this.state.txt,
            comment_id: "" + Date.now(),
            repo_id: this.props.repo,
            request_id: this.props.req
        }));
    },

    onChangeText: function(event) {
        this.setState({txt: event.target.value});
    },

    render: function() {
        var mainArea;
        if (this.state.view === "write") {
            mainArea = (
                <textarea className="CommentBox_textarea"
                    placeholder="Enter cutting remarks here..."
                    onChange={this.onChangeText}
                    value={this.state.txt} />
            );
        }
        else {
            var markdownHtml = marked(this.state.txt);
            mainArea = (
                <div className="CommentBox_preview"
                    dangerouslySetInnerHTML={{__html: markdownHtml}}>
                </div>
            );
        }


        return (
            <div>
            <div>
                <button onClick={this.onWrite}>Write</button>
                <button onClick={this.onPreview}>Preview</button>
            </div>
            {mainArea}
            <div>
                <button onClick={this.onSubmit}>Comment</button>
            </div>
            </div>
        );
    }
});