module.exports = React.createClass({displayName: 'PatchView',


    getUnifiedDiffJsx: function(patch) {
        return (
            <table>
            <tbody>
            {patch.getUnifiedData().map(function(dataLine) {
                return <tr className={"Patch_type_" + dataLine.type}>
                    <td>{dataLine.oldNum}</td>
                    <td>{dataLine.newNum}</td>
                    <td>{dataLine.raw}</td>
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
                {patch.getSideBySideData().old.map(function(dataLine, i) {
                    return (
                        <tr className={"Patch_type_" + dataLine.type} key={i}>
                            <td>{dataLine.oldNum}</td>
                            <td>{dataLine.raw}</td>
                        </tr>
                    );
                })}
                </tbody>
                </table>
            </td><td>
                <table className="Patch_table_right">
                <tbody>
                {patch.getSideBySideData().new.map(function(dataLine, i) {
                    return (
                        <tr className={"Patch_type_" + dataLine.type} key={i}>
                            <td>{dataLine.newNum}</td>
                            <td>{dataLine.raw}</td>
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
