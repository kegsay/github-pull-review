var React = require("react");
var highlightJs = require("highlight.js");
var utils = require("../utils");

var oneLiners = [
    "Enter cutting remarks here...",
    "Bash something into here...",
    "Type a word or two here...",
    "Write down your thoughts here..."
];

module.exports = React.createClass({displayName: 'CommentBox',
    propTypes: {
        onSubmit: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return {
            shouldPreview: false,
            submitting: false,
            inputText: "",
            placeholder: oneLiners[
                Math.floor(Math.random() * oneLiners.length)
            ]
        };
    },

    componentDidUpdate: function() {
        if (this.refs.preview) {
            var node = React.findDOMNode(this.refs.preview);
            var preBlocks = node.getElementsByTagName("pre");
            for (var i = 0; i < preBlocks.length; i++) {
                var codeBlocks = preBlocks[i].getElementsByTagName("code");
                for (var j = 0; j < codeBlocks.length; j++) {
                     highlightJs.highlightBlock(codeBlocks[i]);
                }
            }
        }
    },

    onPreview: function(shouldPreview) {
        this.setState({ shouldPreview: shouldPreview });
    },

    onSubmit: function() {
        var self = this;
        this.setState({ submitting: true });
        this.props.onSubmit(this.state.inputText).done(function(a) {
            self.setState({
                inputText: "",
                submitting: false
            });
        }, function(err) {
            console.error("Failed to submit comment: %s", err);
            self.setState({
                submitting: false
            });
        });
    },

    onChangeText: function(event) {
        this.setState({inputText: event.target.value});
    },

    render: function() {
        var writeClasses = "CommentBox_button CommentBox_tab";
        var previewClasses = "CommentBox_button CommentBox_tab";
        var mainArea;
        if (this.state.shouldPreview) {
            var markdownHtml = utils.markdownToHtml(this.state.inputText);
            mainArea = (
                <div className="CommentBox_preview" ref="preview"
                    dangerouslySetInnerHTML={{__html: markdownHtml}}>
                </div>
            );
            previewClasses += " CommentBox_tab_selected";
        }
        else {
            mainArea = (
                <textarea className="CommentBox_textarea"
                    placeholder={this.state.placeholder}
                    onChange={this.onChangeText}
                    value={this.state.inputText}
                    disabled={this.state.submitting}/>
            );
            writeClasses += " CommentBox_tab_selected";
        }

        return (
            <div className="CommentBox">
                <div>
                    <button onClick={this.onPreview.bind(this, false)} className={writeClasses} >
                        Write
                    </button>
                    <button onClick={this.onPreview.bind(this, true)} className={previewClasses}>
                        Preview
                    </button>
                </div>
                {mainArea}
                <div>
                    <button onClick={this.onSubmit}
                        className="CommentBox_button CommentBox_button_submit">Comment</button>
                </div>
            </div>
        );
    }
});
