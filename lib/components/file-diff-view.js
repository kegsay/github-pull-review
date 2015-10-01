var PatchView = require("./patch-view");
var CommentView = require("./comment-view");


function CommitLabel(sha, label) {
    this.label = label;
    this.sha = sha;
}

module.exports = React.createClass({displayName: 'FileDiffView',

    getInitialState: function() {
        return {
            visible: true,
            unified: false,
            showAllComments: false,
            commits: [
                new CommitLabel("base", "BASE"),
                new CommitLabel("head", "HEAD")
            ],
            fromSha: "base",
            toSha: "head"
        };
    },

    componentDidMount: function() {
        this._setCommitList(this.props.pr, this.props.comments);
    },

    componentWillReceiveProps: function(nextProps) {
        this._setCommitList(nextProps.pr, nextProps.comments);
    },

    _setCommitList: function(pr, comments) {
        var commits = [
            new CommitLabel(pr.getBaseSha(), "BASE")
        ];
        // convert the list of comments into a Set<CommitLabel> inserted in commits
        // in chronological order
        var seenShas = {};
        seenShas[pr.getBaseSha()] = "yup";
        comments.forEach(function(comment) {
            if (seenShas[comment.getSha()]) { return; }
            var label = comment.getShortSha() + " (" + commits.length + ")";
            if (comment.getSha() === pr.getHeadSha()) {
                label = "HEAD";
            }
            commits.push(
                new CommitLabel(comment.getSha(), label)
            );
            seenShas[comment.getSha()] = "yup";
        })

        if (!seenShas[pr.getHeadSha()]) {
            // add head after all the comment commit labels
            commits.push(new CommitLabel(pr.getHeadSha(), "HEAD"));
        }
        console.log("commits: %s", JSON.stringify(commits));
        this.setState({
            commits: commits,
            fromSha: commits[0].sha,
            toSha: commits[commits.length - 1].sha
        });
    },

    onCommitChange: function(isFrom, event) {
        var newSha = event.target.value;
        var badSha = false;
        var i;
        if (isFrom) {
            // make sure the new sha isn't >= the to sha
            for (i = 0; i < this.state.commits.length; i++) {
                if (this.state.commits[i].sha === this.state.toSha) {
                    badSha = true;
                    break;
                }
                else if (this.state.commits[i].sha === newSha) {
                    break;
                }
            }
            console.log("from bad=%s", badSha);
            if (!badSha) {
                this.setState({fromSha: newSha});
            }
        }
        else {
            // make sure the new sha isn't <= the from sha
            for (i = this.state.commits.length - 1; i >= 0; i--) {
                if (this.state.commits[i].sha === this.state.fromSha) {
                    badSha = true;
                    break;
                }
                else if (this.state.commits[i].sha === newSha) {
                    break;
                }
            }
            console.log("to bad=%s", badSha);
            if (!badSha) {
                this.setState({toSha: newSha});
            }
        }
    },

    toggleVisible: function() {
        this.setState({
            visible: !this.state.visible
        });
    },

    toggleUnified: function() {
        this.setState({
            unified: !this.state.unified
        });
    },

    toggleAllComments: function() {
        this.setState({
            showAllComments: !this.state.showAllComments
        });
    },

    render: function() {
        var self = this;
        var diff = this.props.diff;
        var pr = this.props.pr;
        var visibleText = this.state.visible ? "Hide" : "Show";
        var unifyText = this.state.unified ? "Side-by-Side" : "Unified";
        var otherCommentsText = (
            this.state.showAllComments ? "Hide all comments" : "Show all comments"
        );
        var patchElement, visibilityButton, patchButton, otherCommentsButton, allCommentsElement;

        if (diff.getPatch()) {
            visibilityButton = (
                <button className="FileDiffView_show_hide_button"
                    onClick={this.toggleVisible}>
                    {visibleText}
                </button>
            );
            patchButton = (
                <button className="FileDiffView_unify_button"
                    onClick={this.toggleUnified}>
                    {unifyText}
                </button>
            );
        }

        
        var commentCount;
        var headComments = [];
        if (this.props.comments.length > 0) {
            headComments = this.props.comments.filter(function(c) {
                return c.getSha() === pr.getHeadSha();
            });

            commentCount = (
                <span className="FileDiffView_counts_comments">
                    {headComments.length} comments ({this.props.comments.length} total)
                </span>
            );

            if (headComments.length < this.props.comments.length) {
                otherCommentsButton = (
                    <button className="FileDiffView_all_comments_button"
                        onClick={this.toggleAllComments}>
                        {otherCommentsText}
                    </button>
                );
            }
        }
        this.props.comments.forEach(function(c) {
            console.log("%s BASE: %s HEAD: %s comment SHA: %s  Comment: %s Line: %s",
                c.getFilePath(), pr.getBaseSha(), pr.getHeadSha(), c.sha, c.getComment().getBody(),
                c.patch.getLastLine().getRawLine());
        });

        if (this.state.showAllComments) {
            allCommentsElement = (
                <div className="FileDiffView_all_comments">
                    {this.props.comments.filter(function(cmt) {
                        return cmt.getSha() !== pr.getHeadSha()
                    }).map(function(cmt, i) {
                        return (
                            <CommentView comment={cmt} key={i} />
                        );
                    })}
                </div>
            );
        }

        if (this.state.visible) {
            patchElement = (
                <PatchView patch={diff.getPatch()} pr={pr}
                        unified={this.state.unified} comments={headComments}
                        path={diff.getFilePathString()} />
            );
        }

        return (
            <div className="FileDiffView">
                <div className="FileDiffView_header">
                    <span
                        className={
                            "FileDiffView_header_status " +
                            "FileDiffView_header_status_" + diff.getStatus()
                        }>
                        {diff.getStatusString()}
                    </span>
                    <span className="FileDiffView_header_path">
                        {diff.getFilePathString()}
                    </span>
                    {visibilityButton}
                    {patchButton}
                    <div className="FileDiffView_header_counts">
                        <select onChange={this.onCommitChange.bind(this, true)} value={this.state.fromSha}>
                            {this.state.commits.map(function(c, i) {
                                // React whines and says we should use defaultValue/value but:
                                //  - defaultValue doesn't update (initial load only) which is no good
                                //    when we get updated props
                                //  - value needs gut-wrenching the DOM node to set the new value when
                                //    the user selects a new option.
                                return (
                                    <option value={c.sha}>
                                        {c.label}
                                    </option>
                                );
                            })}
                        </select>
                        <select onChange={this.onCommitChange.bind(this, false)} value={this.state.toSha}>
                            {this.state.commits.map(function(c, i) {
                                return (
                                    <option value={c.sha}>
                                        {c.label}
                                    </option>
                                );
                            })}
                        </select>
                        {otherCommentsButton}
                        {commentCount}
                        <span className="FileDiffView_counts_additions">
                            {diff.getAddCount()}++
                        </span>
                        <span className="FileDiffView_counts_deletions">
                            {diff.getRemoveCount()}--
                        </span>
                        <span className="FileDiffView_counts_changes">
                            {diff.getChangeCount()}
                        </span>
                    </div>
                </div>
                {allCommentsElement}
                {patchElement}
            </div>
        );
    }
});
