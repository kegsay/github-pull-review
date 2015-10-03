var CommentView = require("./comment-view");
var CommentBox = require("./comment-box");
var Patch = require("../logic/models/patch");
var Line = require("../logic/models/line");

module.exports = React.createClass({displayName: 'PatchView',
    propTypes: {
        showUnified: React.PropTypes.bool.isRequired,
        patch: React.PropTypes.instanceOf(Patch)
    },

    getInitialState: function() {
        return {
            selectedLines: []
        };
    },

    _onLineComment: function(selectedLine, text) {
        console.log("_onLineComment -> sel=%s >>> %s", 
            JSON.stringify(selectedLine), text);
    },

    _onReplyToComment: function(inReplyTo, text) {
        console.log("_onReplyToComment %s >> %s", JSON.stringify(inReplyTo), text);
    },

    _getSelectedLine: function(line, isOldFile) {
        var index = this._getSelectedLineIndex(line, isOldFile);
        return this.state.selectedLines[index];
    },

    _getSelectedLineIndex: function(line, isOldFile) {
        isOldFile = Boolean(isOldFile);
        for (var i = 0; i < this.state.selectedLines.length; i++) {
            if (this.state.selectedLines[i].line.matches(line) &&
                    this.state.selectedLines[i].isOldFile === isOldFile) {
                return i;
            }
        }
        return -1;
    },

    _getLineJsx: function(line) {
        var text = (
            <td className={"PatchView_type_" + line.getType()}>
            {line.getRawLine()}
            </td>
        );
        if (line.hasHighlightedSection()) {
            var sections = line.getHighlightedSections();
            text = (
                <td className={"PatchView_type_" + line.getType()}>
                    {sections[0]}
                    <span className={"PatchView_highlight_" + line.getType()}>
                        {sections[1]}
                    </span>
                    {sections[2]}
                </td>
            );
        }
        return text;
    },

    _getLineComments: function(line, isUnified) {
        var self = this;
        var commentsOnLine = self.props.comments.filter(function(lineComment) {
            return lineComment.isOnLine(line, isUnified);
        });
        return commentsOnLine;
    },

    onLineClick: function(line, isOldFile) {
        isOldFile = Boolean(isOldFile);
        var selectedLines = this.state.selectedLines;
        var lineIndex = this._getSelectedLineIndex(line, isOldFile);
        var lineInfo = selectedLines[lineIndex];
        if (lineInfo) {
            selectedLines.splice(lineIndex, 1);
        }
        else {
            selectedLines.push({
                line: line,
                draft: "",
                isOldFile: isOldFile,
                pos: this.props.patch.getLinePosition(line)
            });
        }
        console.log("Selected lines: %s", selectedLines.length);

        this.setState({
            selectedLines: selectedLines
        });
    },

    getUnifiedDiffJsx: function(patch) {
        var self = this;

        var tableLines = [];

        // add in extra rows for comments - we need to do this via tableLines indirection
        // to get around React's "return one top level element please" rule
        patch.getUnifiedData().forEach(function(line, i) {
            tableLines.push(
                <tr className={"PatchView_type_" + line.getType()} key={i}>
                    <td className="PatchView_line_num"
                        onClick={self.onLineClick.bind(self, line, false)}>
                        {line.getOldFileLineNum()}
                    </td>
                    <td className="PatchView_line_num"
                        onClick={self.onLineClick.bind(self, line, false)}>
                        {line.getNewFileLineNum()}
                    </td>
                    {self._getLineJsx(line)}
                </tr>
            );
            // potentially add in a selected line comment box
            var selectedLine = self._getSelectedLine(line);
            if (selectedLine) {
                tableLines.push(
                    <tr key={"box" + i}>
                        <td />
                        <td />
                        <td>
                            <CommentBox
                            onSubmit={self._onLineComment.bind(self, selectedLine)} />
                        </td>
                    </tr>
                );
            }
            // add line comments
            var comments = self._getLineComments(line, true);
            comments.forEach(function(cmt, commentIndex) {
                tableLines.push(
                    <tr key={"cmt" + commentIndex}>
                        <td />
                        <td />
                        <td>
                            <CommentView comment={cmt} />
                        </td>
                    </tr>
                );
            });
            if (comments.length > 0) {
                // add a comment box to reply to this thread
                tableLines.push(
                    <tr key={"reply" + i}>
                        <td />
                        <td />
                        <td>
                            <CommentBox
                            onSubmit={self._onReplyToComment.bind(
                                self, comments[comments.length - 1])} />
                        </td>
                    </tr>
                )
            }
        });

        return (
            <table>
            <tbody>
            {tableLines.map(function(l) { return l; })}
            </tbody>
            </table>
        );
    },

    getSideBySideDiffJsx: function(patch) {
        var self = this;
        var tableLines = [];
        patch.getSideBySideData().old.forEach(function(leftLine, i) {
            var rightLine = patch.getSideBySideData().new[i];
            var leftLineSelected = self._getSelectedLine(leftLine, true);
            var rightLineSelected = self._getSelectedLine(rightLine, false);

            tableLines.push(
                <tr key={i}>
                <td className={"PatchView_line_num PatchView_type_" + leftLine.getType()}
                        onClick={self.onLineClick.bind(self, leftLine, true)}>
                    {leftLine.getOldFileLineNum()}
                </td>
                {self._getLineJsx(leftLine)}
                <td className={"PatchView_line_num PatchView_type_" + rightLine.getType()}
                        onClick={self.onLineClick.bind(self, rightLine, false)}>
                    {rightLine.getNewFileLineNum()}
                </td>
                {self._getLineJsx(rightLine)}
                </tr>
            );
            // potentially add row for comment box
            if (leftLineSelected || rightLineSelected) {
                var oldCommentBox, newCommentBox;
                if (leftLineSelected) {
                    oldCommentBox = (
                        <CommentBox
                            onSubmit={self._onLineComment.bind(self, leftLineSelected)} />
                    );
                }
                if (rightLineSelected) {
                    newCommentBox = (
                        <CommentBox
                            onSubmit={self._onLineComment.bind(self, rightLineSelected)} />
                    );
                }
                tableLines.push(
                    <tr key={"box" + i}>
                        <td /> // line num
                        <td> {oldCommentBox} </td>
                        <td /> // line num
                        <td> {newCommentBox} </td>
                    </tr>
                );
            }
            // add any line comments
            var leftComments = self._getLineComments(leftLine, false);
            var rightComments = self._getLineComments(rightLine, false);
            // NOP lines will have duplicate comments for both left/right, so suppress left.
            if (leftLine.getType() === Line.TYPE_NOP && rightLine.getType() === Line.TYPE_NOP &&
                    leftComments.length > 0 && rightComments.length > 0) {
                leftComments = [];
            }
            // convert Comments into CommentViews and tack on CommentBox to ones with comments
            if (leftComments.length > 0) { leftComments.push("box"); }
            if (rightComments.length > 0) { rightComments.push("box"); }
            leftComments = leftComments.map(function(cmt) {
                if (cmt === "box") {
                    return <CommentBox 
                        onSubmit={self._onReplyToComment.bind(
                        // -2 to get the last real Comment (abit naughty since we rely on this
                        // not clobbering leftComments immediately else we'd pull out a
                        // CommentView!)
                        self, leftComments[leftComments.length - 2])} />;
                }
                return <CommentView comment={cmt} />;
            });
            rightComments = rightComments.map(function(cmt) {
                if (cmt === "box") {
                    return <CommentBox 
                        onSubmit={self._onReplyToComment.bind(
                        self, rightComments[rightComments.length - 2])} />;
                }
                return <CommentView comment={cmt} />;
            });

            var numRowsToAdd = Math.max(leftComments.length, rightComments.length);
            for (var j = 0; j < numRowsToAdd; j++) {
                tableLines.push(
                    <tr key={"cmt" + i + "num" + j}>
                        <td /> // line num
                        <td> {leftComments[j]} </td>
                        <td /> // line num
                        <td> {rightComments[j]} </td>
                    </tr>
                );
            }
        });

        return (
            <table className="PatchView_table">
                <tbody>
                    {tableLines.map(function(l) { return l; })}
                </tbody>
            </table>
        )
    },

    render: function() {
        var patch = this.props.patch;
        var showUnified = this.props.showUnified;
        if (!patch) {
            // possible for renamed files with no diffs.
            return (
                <div> </div>
            );
        }

        return (
            <div className="PatchView">
                {showUnified ? this.getUnifiedDiffJsx(patch) : this.getSideBySideDiffJsx(patch)}
            </div>
        );
    }
});
