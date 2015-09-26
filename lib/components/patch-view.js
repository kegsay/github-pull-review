module.exports = React.createClass({displayName: 'PatchView',


    getUnifiedDiffJsx: function(patch) {
        return (
            <table>
            <tbody>
            {patch.getUnifiedData().map(function(line, i) {
                return <tr className={"Patch_type_" + line.getType()} key={i}>
                    <td>{line.getOldFileLineNum()}</td>
                    <td>{line.getNewFileLineNum()}</td>
                    <td>{line.getRawLine()}</td>
                </tr>
            })}
            </tbody>
            </table>
        );
    },

    getSideBySideDiffJsx: function(patch) {
        return (
            <table className="Patch_table"><tr><td>
                <table className="Patch_table_left">
                <tbody>
                {patch.getSideBySideData().old.map(function(line, i) {
                    return (
                        <tr className={"Patch_type_" + line.getType()} key={i}>
                            <td>{line.getOldFileLineNum()}</td>
                            <td>{line.getRawLine()}</td>
                        </tr>
                    );
                })}
                </tbody>
                </table>
            </td><td>
                <table className="Patch_table_right">
                <tbody>
                {patch.getSideBySideData().new.map(function(line, i) {
                    return (
                        <tr className={"Patch_type_" + line.getType()} key={i}>
                            <td>{line.getNewFileLineNum()}</td>
                            <td>{line.getRawLine()}</td>
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
