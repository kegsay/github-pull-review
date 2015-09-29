var CommentView = require("./comment-view");
var CommentBox = require("./comment-box");

module.exports = React.createClass({displayName: 'PatchView',

    getInitialState: function() {
        return {
            selectedLines: []
        };
    },

    _getLineJsx: function(line) {
        var text = <td>{line.getRawLine()}</td>;
        if (line.hasHighlightedSection()) {
            var sections = line.getHighlightedSections();
            text = (
                <td>
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

    _getLineCommentJsx: function(lineComment, key) {
        return (
            <CommentView comment={lineComment} key={key} />
        );
    },

    _addCommentBox: function(table, isUnified, inReplyTo, hiddenStyle) {
        var extraCol = isUnified ? <td /> : null;

        table.push(
            <tr>
            <td />
            {extraCol}
            <td style={hiddenStyle}>
                <CommentBox pr={this.props.pr}
                    in_reply_to={inReplyTo}/>
            </td>
            </tr>
        );
    },

    _addLineComments: function(line, table, isUnified, otherTableLine) {
        var self = this;
        var commentsOnLine = self.props.comments.filter(function(lineComment) {
            return lineComment.isOnLine(line, isUnified);
        });
        if (commentsOnLine.length > 0 && isUnified) {
            commentsOnLine.forEach(function(cmt, i) {
                table.push(
                    <tr>
                        <td />
                        <td />
                        <td>
                            {self._getLineCommentJsx(cmt, i)}
                        </td>
                    </tr>
                );
            });
            self._addCommentBox(
                table, isUnified, commentsOnLine[commentsOnLine.length - 1]
            );
        }
        else if (!isUnified) {
            var commentsOnOtherTable = self.props.comments.filter(function(lineComment) {
                return lineComment.isOnLine(otherTableLine, isUnified);
            });
                
            var comments = commentsOnLine.length > 0 ? commentsOnLine : commentsOnOtherTable;
            var hidden;
            if (commentsOnLine.length === 0) {
                hidden = {
                    visibility: "hidden"
                };
            }
            comments.forEach(function(cmt, i) {
                table.push(
                    <tr>
                        <td />
                        <td style={hidden}>
                            {self._getLineCommentJsx(cmt, i)}
                        </td>
                    </tr>
                );
            });
            if (comments.length > 0) {
                self._addCommentBox(
                    table, isUnified, comments[comments.length - 1], hidden
                );
            }
        }
    },

    onLineClick: function(line) {
        var selectedLines = this.state.selectedLines;
        var lineIndex = -1;
        lineInfo = selectedLines.filter(function(l, i) {
            var match = l.line.matches(line);
            if (match) {
                lineIndex = i;
            }
            return match;
        })[0];
        if (lineInfo) {
            selectedLines.splice(lineIndex, 1);
        }
        else {
            selectedLines.push({
                line: line,
                draft: ""
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
            var text = self._getLineJsx(line);
            tableLines.push(
                <tr className={"PatchView_type_" + line.getType()} key={i}>
                    <td className="PatchView_line_num"
                        onClick={self.onLineClick.bind(self, line)}>
                        {line.getOldFileLineNum()}
                    </td>
                    <td className="PatchView_line_num"
                        onClick={self.onLineClick.bind(self, line)}>
                        {line.getNewFileLineNum()}
                    </td>
                    {text}
                </tr>
            );
            var isLineSelected = self.state.selectedLines.filter(
            function(l) {
                return l.line.matches(line);
            }).length > 0;
            if (isLineSelected) {
                self._addCommentBox(tableLines, true);
            }
            self._addLineComments(line, tableLines, true);
        });

        return (
            <table>
            <tbody>
            {tableLines.map(function(l) {
                return {l};
            })}
            </tbody>
            </table>
        );
    },

    getSideBySideDiffJsx: function(patch) {
        var self = this;

        var leftTableLines = [];
        var rightTableLines = [];

        // add in extra rows for comments - we need to do this via tableLines indirection
        // to get around React's "return one top level element please" rule
        patch.getSideBySideData().old.forEach(function(line, i) {
            var text = self._getLineJsx(line);
            leftTableLines.push(
                <tr className={"PatchView_type_" + line.getType()} key={i}>
                    <td className="PatchView_line_num"
                            onClick={self.onLineClick.bind(self, line)}>
                        {line.getOldFileLineNum()}
                    </td>
                    {text}
                </tr>
            );
            self._addLineComments(line, leftTableLines, false,  patch.getSideBySideData().new[i]);
        });
        patch.getSideBySideData().new.forEach(function(line, i) {
            var text = self._getLineJsx(line);
            rightTableLines.push(
                <tr className={"PatchView_type_" + line.getType()} key={i}>
                    <td className="PatchView_line_num"
                            onClick={self.onLineClick.bind(self, line)}>
                        {line.getNewFileLineNum()}
                    </td>
                    {text}
                </tr>
            );
            self._addLineComments(line, rightTableLines, false,  patch.getSideBySideData().old[i]);
        });

        return (
            <table className="PatchView_table"><tr><td>
                <table className="PatchView_table_left">
                <tbody>
                {leftTableLines.map(function(l) { return l; })}
                </tbody>
                </table>
            </td><td>
                <table className="PatchView_table_right">
                <tbody>
                {rightTableLines.map(function(l) {return l; })}
                </tbody>
                </table>
            </td></tr></table>
        )
    },

    render: function() {
        var patch = this.props.patch;
        var unified = this.props.unified;
        if (!patch) {
            // possible for renamed files with no diffs.
            return (
                <div> </div>
            );
        }

        return (
            <div className="PatchView">
                {unified ? this.getUnifiedDiffJsx(patch) : this.getSideBySideDiffJsx(patch)}
            </div>
        );
    }
});