var ActionMixin = require("../logic/actions").ActionMixin([
    "pr_info", "file_diffs", "line_comments"
]);
var dispatcher = require("../logic/dispatcher");
var actions = require("../logic/actions");
var CommentListView = require("./comment-list-view");
var CommitListView = require("./commit-list-view");
var FileDiffListView = require("./file-diff-list-view");

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
        var pr = this.state.pr_info.pr;
        if (pr) {
            dispatcher.dispatch(actions.create("get_diffs", {
                repo: pr.getRepo(),
                id: pr.getId(),
                allow_cached: true
            }));
            this.onView("diffs");
        }
    },

    onViewComments: function() {
        this.onView("comments");
    },

    onViewCommits: function() {
        this.onView("commits");
    },

    render: function() {
        var pr = this.state.pr_info.pr;
        if (!pr || Object.keys(pr).length === 0) {
            return <div></div>;
        }
        var fileDiffs = this.state.file_diffs ? this.state.file_diffs.files : [];
        var lineComments = this.state.line_comments ? this.state.line_comments.comments : [];

        var mainSection;
        switch (this.state.viewing) {
            case "diffs":
                mainSection = (
                    <FileDiffListView diffs={fileDiffs} comments={lineComments}
                        repo={pr.getRepo()} req={pr.getId()} />
                );
                break;
            case "commits":
                mainSection = (
                    <CommitListView commits={pr.getCommits()}
                        repo={pr.getRepo()} req={pr.getId()} />
                );
                break;
            case "comments":
                mainSection = (
                    <CommentListView comments={pr.getComments()}
                        repo={pr.getRepo()} req={pr.getId()} />
                );
                break;
            default:
                console.log("Unknown viewing state: %s", this.state.viewing);
                break;
        }


        var intent;
        if (pr.getState() === "merged") {
            intent = (
                <span>
                {pr.getMerger().getUserLinkJsx()} merged
                </span>
            );
        }
        else {
            intent = (
                <span>
                {pr.getOwner().getUserLinkJsx()} wants to merge
                </span>
            );
        }

        return (
            <div>
                <div className="PullRequestOverview_title">
                    {pr.getTitle()} (
                        <a href={pr.getLink()} target="_blank">
                            #{pr.getId()}
                        </a>
                    )
                </div>
                <div className="PullRequestOverview_status_bar">
                    <span className={
                        "PullRequestOverview_state PullRequestOverview_state_" + pr.getState()
                    }>
                        {pr.getPrettyState()}
                    </span>
                    <span>
                    {intent} {pr.getCommits().length} commits into <span className="inline_code">
                            {pr.getDestRepo()}
                        </span> from <span className="inline_code">
                            {pr.getSourceRepo()}
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
