var CommentView = require("./comment-view");
var CommentBox = require("./comment-box");

module.exports = React.createClass({displayName: 'PatchView',

    getInitialState: function() {
        return {
            selectedLines: []
        };
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

    _addCommentBox: function(table, isUnified, selectedLine, inReplyTo, hiddenStyle) {
        var extraCol = isUnified ? <td /> : null;
        selectedLine = selectedLine || {};
        inReplyTo = inReplyTo || null;
        table.push(
            <tr>
            <td />
            {extraCol}
            <td style={hiddenStyle}>
                <CommentBox pr={this.props.pr} line={selectedLine.line}
                    in_reply_to={inReplyTo} path={this.props.path}
                    pos={selectedLine.pos} />
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
                table, isUnified, null, commentsOnLine[commentsOnLine.length - 1]
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
                    table, isUnified, null, comments[comments.length - 1], hidden
                );
            }
        }
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
            var text = self._getLineJsx(line);
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
                    {text}
                </tr>
            );
            var selectedLine = self._getSelectedLine(line);
            if (selectedLine) {
                self._addCommentBox(tableLines, true, selectedLine);
            }
            self._addLineComments(line, tableLines, true);
        });

        return (
            <table>
            <tbody>
            {tableLines.map(function(l) {
                return l;
            })}
            </tbody>
            </table>
        );
    },

    getSideBySideDiffJsx: function(patch) {
        var self = this;

        var leftTableLines = [];
        var rightTableLines = [];

        // FIXME: Code duplication sadness :(((((
        // add in extra rows for comments - we need to do this via tableLines indirection
        // to get around React's "return one top level element please" rule
        patch.getSideBySideData().old.forEach(function(line, i) {
            var text = self._getLineJsx(line);
            leftTableLines.push(
                <tr className={"PatchView_type_" + line.getType()} key={i}>
                    <td className="PatchView_line_num"
                            onClick={self.onLineClick.bind(self, line, true)}>
                        {line.getOldFileLineNum()}
                    </td>
                    {text}
                </tr>
            );

            var selectedLine = self._getSelectedLine(line, true);
            var otherLineSelected = self._getSelectedLine(
                patch.getSideBySideData().new[i]
            );
            if (selectedLine || otherLineSelected) {
                self._addCommentBox(
                    leftTableLines, false, selectedLine, null,
                    (otherLineSelected && !selectedLine) ? {visibility: "hidden"} : undefined
                );
            }

            self._addLineComments(
                line, leftTableLines, false, patch.getSideBySideData().new[i]
            );
        });
        patch.getSideBySideData().new.forEach(function(line, i) {
            var text = self._getLineJsx(line);
            rightTableLines.push(
                <tr className={"PatchView_type_" + line.getType()} key={i}>
                    <td className="PatchView_line_num"
                            onClick={self.onLineClick.bind(self, line, false)}>
                        {line.getNewFileLineNum()}
                    </td>
                    {text}
                </tr>
            );

            var selectedLine = self._getSelectedLine(line);
            var otherLineSelected = self._getSelectedLine(
                patch.getSideBySideData().old[i], true
            );

            if (selectedLine || otherLineSelected) {
                self._addCommentBox(
                    rightTableLines, false, selectedLine, null,
                    (otherLineSelected && !selectedLine) ? {visibility: "hidden"} : undefined
                );
            }

            self._addLineComments(
                line, rightTableLines, false, patch.getSideBySideData().old[i]
            );
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
