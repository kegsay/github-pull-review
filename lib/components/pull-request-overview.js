var ActionMixin = require("../logic/actions").ActionMixin([
    "pr_info"
]);

module.exports = React.createClass({displayName: 'PullRequestOverview',
    mixins: [ActionMixin],

    render: function() {
        var pr = this.state.pr_info;
        if (Object.keys(pr).length === 0) {
            return <div></div>;
        }


        var intent;
        if (pr.state === "merged") {
            intent = (
                <span>
                <a href={pr.merged.by_url}>{pr.merged.by}</a> merged
                </span>
            );
        }
        else {
            intent = (
                <span>
                <a href={pr.owner_url}>{pr.owner}</a> wants to merge
                </span>
            );
        }
        return (
            <div>
                <div className="PullRequestOverview_title">
                    {pr.title} (<a href={pr.html_link} target="_blank">#{pr.id}</a>)
                </div>
                <div>
                    <span className={"PullRequestOverview_state PullRequestOverview_state_" + pr.state}>
                        {pr.state}
                    </span>
                    <span>
                    {intent} {pr.num_commits} commits into <span className="inline_code">
                            {pr.dst_repo}
                        </span> from <span className="inline_code">
                            {pr.src_repo}
                        </span>
                    </span>
                </div>
            </div>
        );
    }
});
