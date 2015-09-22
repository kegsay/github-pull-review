var ActionMixin = require("../logic/actions").ActionMixin([
    "post_comment_response"
]);
var dispatcher = require("../logic/dispatcher");
var actions = require("../logic/actions");
var utils = require("./utils");

var oneLiners = [
    "Enter cutting remarks here...",
    "Bash something into here...",
    "Type a word or two here...",
    "Write down your thoughts here..."
];

module.exports = React.createClass({displayName: 'CommentBox',
    mixins: [ActionMixin],

    getInitialState: function() {
        return {
            view: "write",
            sending_id: null,
            txt: "",
            placeholder: oneLiners[
                Math.floor(Math.random() * oneLiners.length)
            ]
        };
    },

    onReceiveAction: function(action, data) {
        if (action !== "post_comment_response") {
            return;
        }
        if (data.comment_id === this.state.sending_id) {
            this.setState({
                sending_id: null,
                txt: ""
            });
        }
    },

    onWrite: function() {
        this.setState({ view: "write" });
    },

    onPreview: function() {
        this.setState({ view: "preview" });
    },

    onSubmit: function() {
        var commentId = "" + Date.now();
        this.setState({
            sending_id: commentId
        });
        dispatcher.dispatch(actions.create("post_comment", {
            text: this.state.txt,
            comment_id: commentId,
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
            var disableTextEntry = (
                this.state.sending_id !== null
            );
            mainArea = (
                <textarea className="CommentBox_textarea"
                    placeholder={this.state.placeholder}
                    onChange={this.onChangeText}
                    value={this.state.txt}
                    disabled={disableTextEntry}/>
            );
        }
        else {
            var markdownHtml = utils.markdownToHtml(this.state.txt);
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
