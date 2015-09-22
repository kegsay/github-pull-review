var ActionMixin = require("../logic/actions").ActionMixin([
    "pr_info"
]);
var CommentsView = require("./comments-view");

module.exports = React.createClass({displayName: 'PullRequestOverview',
    mixins: [ActionMixin],

    getInitialState: function() {
        return {
            viewing: "comments"
        };
    },

    onView: function(thing) {
        this.setState({
            viewing: thing
        });
    },

    onViewDiffs: function() {
        this.onView("diffs");
    },

    onViewComments: function() {
        this.onView("comments");
    },

    onViewCommits: function() {
        this.onView("commits");
    },

    render: function() {
        var pr = this.state.pr_info;
        if (!pr || Object.keys(pr).length === 0) {
            return <div></div>;
        }

        var mainSection;
        switch (this.state.viewing) {
            case "diffs":
                break;
            case "commits":
                break;
            case "comments":
                mainSection = (
                    <CommentsView comments={pr.comments}
                        repo={pr.owner_repo} req={pr.id} />
                );
                break;
            default:
                console.log("Unknown viewing state: %s", this.state.viewing);
                break;
        }


        var intent;
        if (pr.state === "merged") {
            intent = (
                <span>
                <a href={pr.merged.by_url} target="_blank">{pr.merged.by}</a> merged
                </span>
            );
        }
        else {
            intent = (
                <span>
                <a href={pr.owner_url} target="_blank">{pr.owner}</a> wants to merge
                </span>
            );
        }

        return (
            <div>
                <div className="PullRequestOverview_title">
                    {pr.title} (
                        <a href={pr.html_link} target="_blank">
                            #{pr.id}
                        </a>
                    )
                </div>
                <div className="PullRequestOverview_status_bar">
                    <span className={
                        "PullRequestOverview_state PullRequestOverview_state_" + pr.state
                    }>
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
                <div>
                <button onClick={this.onViewComments}>Comments</button>
                <button onClick={this.onViewCommits}>Commits</button>
                <button onClick={this.onViewDiffs}>Diffs</button>
                </div>
                {mainSection}
            </div>
        );
    }
});
