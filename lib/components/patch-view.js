var CommentView = require("./comment-view");
var CommentBox = require("./comment-box");

module.exports = React.createClass({displayName: 'PatchView',

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
            table.push(
                <tr>
                <td />
                <td />
                <td>
                    <CommentBox pr={this.props.pr}
                        in_reply_to={commentsOnLine[commentsOnLine.length - 1]}/>
                </td>
                </tr>
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
                table.push(
                    <tr>
                    <td />
                    <td style={hidden}>
                        <CommentBox pr={this.props.pr} in_reply_to={comments[comments.length - 1]}/>
                    </td>
                    </tr>
                );
            }
        }
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
                    <td>{line.getOldFileLineNum()}</td>
                    <td>{line.getNewFileLineNum()}</td>
                    {text}
                </tr>
            );
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
                    <td>{line.getOldFileLineNum()}</td>
                    {text}
                </tr>
            );
            self._addLineComments(line, leftTableLines, false,  patch.getSideBySideData().new[i]);
        });
        patch.getSideBySideData().new.forEach(function(line, i) {
            var text = self._getLineJsx(line);
            rightTableLines.push(
                <tr className={"PatchView_type_" + line.getType()} key={i}>
                    <td>{line.getNewFileLineNum()}</td>
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
