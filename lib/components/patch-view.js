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

    getUnifiedDiffJsx: function(patch) {
        var self = this;
        return (
            <table>
            <tbody>
            {patch.getUnifiedData().map(function(line, i) {
                var text = self._getLineJsx(line);
                return <tr className={"PatchView_type_" + line.getType()} key={i}>
                    <td>{line.getOldFileLineNum()}</td>
                    <td>{line.getNewFileLineNum()}</td>
                    {text}
                </tr>
            })}
            </tbody>
            </table>
        );
    },

    getSideBySideDiffJsx: function(patch) {
        var self = this;
        return (
            <table className="PatchView_table"><tr><td>
                <table className="PatchView_table_left">
                <tbody>
                {patch.getSideBySideData().old.map(function(line, i) {
                    var text = self._getLineJsx(line);
                    return (
                        <tr className={"PatchView_type_" + line.getType()} key={i}>
                            <td>{line.getOldFileLineNum()}</td>
                            {text}
                        </tr>
                    );
                })}
                </tbody>
                </table>
            </td><td>
                <table className="PatchView_table_right">
                <tbody>
                {patch.getSideBySideData().new.map(function(line, i) {
                    var text = self._getLineJsx(line);
                    return (
                        <tr className={"PatchView_type_" + line.getType()} key={i}>
                            <td>{line.getNewFileLineNum()}</td>
                            {text}
                        </tr>
                    );
                })}
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
