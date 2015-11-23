var React = require("react");
var PatchView = require("./patch-view");
var CommentDiffListView = require("./comment-diff-list-view");

function CommitLabel(sha, label) {
    this.label = label;
    this.sha = sha;
}

module.exports = React.createClass({displayName: 'FileDiffView',

    propTypes: {
        onReplyToComment: React.PropTypes.func.isRequired,
        onLineComment: React.PropTypes.func.isRequired,
        pr: React.PropTypes.any.isRequired,
        comments: React.PropTypes.array.isRequired,
        diff: React.PropTypes.any.isRequired,
        controller: React.PropTypes.any.isRequired,
        onLineClick: React.PropTypes.func // fn(FileDiff, lineId: String, Line)
    },

    getDefaultProps: function() {
        return {
            onLineClick: function() {}
        };
    },

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
            toSha: "head",
            selectedDiff: null
        };
    },

    componentDidMount: function() {
        this._setCommitList(this.props.pr, this.props.comments);
        var diff = this.props.diff;
        if (diff.getStatus() === "removed") {
            this.setState({
                visible: false
            });
        }
    },

    componentWillReceiveProps: function(nextProps) {
        this._setCommitList(nextProps.pr, nextProps.comments);
    },

    _onLineComment: function(pos, text) {
        return this.props.onLineComment(
            this.props.diff.getFilePathString(), pos, text
        );
    },

    _onReplyToComment: function(lineComment, text) {
        return this.props.onReplyToComment(
            this.props.diff.getFilePathString(), lineComment, text
        );
    },

    _setCommitList: function(pr, comments) {
        var commits = [
            new CommitLabel(pr.getDest().getSha(), "BASE")
        ];
        // convert the list of comments into a Set<CommitLabel> inserted in commits
        // in chronological order
        var seenShas = {};
        seenShas[pr.getDest().getSha()] = "yup";
        comments.forEach(function(comment) {
            if (seenShas[comment.getSha()]) { return; }
            var label = comment.getShortSha() + " (" + commits.length + ")";
            if (comment.getSha() === pr.getSource().getSha()) {
                label = "HEAD";
            }
            commits.push(
                new CommitLabel(comment.getSha(), label)
            );
            seenShas[comment.getSha()] = "yup";
        })

        if (!seenShas[pr.getSource().getSha()]) {
            // add head after all the comment commit labels
            commits.push(new CommitLabel(pr.getSource().getSha(), "HEAD"));
        }
        console.log("commits: %s", JSON.stringify(commits));
        this.setState({
            commits: commits,
            fromSha: commits[0].sha,
            toSha: commits[commits.length - 1].sha
        });
    },

    _updateDiff: function(fromSha, toSha) {
        var self = this;
        this.props.controller.getCommitDiffs(
            this.props.pr.getRepo(), fromSha, toSha, this.props.diff.getFilePathString()
        ).done(function(diff) {
            self.setState({
                selectedDiff: diff
            });
        }, function(err) {
            console.error("Failed to get commit diffs: %s", err);
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
            if (!badSha) {
                this.setState({fromSha: newSha});
                this._updateDiff(newSha, this.state.toSha);
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
            if (!badSha) {
                this.setState({toSha: newSha});
                this._updateDiff(this.state.fromSha, newSha);
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

    onToggleCommits: function(lineComment, wantEarlierCommits) {
        var commentSha = lineComment.getSha();
        var latestSha = this.state.commits[this.state.commits.length - 1].sha;
        var earliestSha = this.state.commits[0].sha;
        if (earliestSha === commentSha && wantEarlierCommits ||
                latestSha === commentSha && !wantEarlierCommits) {
            return; // cannot satisfy.
        }
        if (wantEarlierCommits) {
            this.setState({
                fromSha: earliestSha,
                toSha: commentSha
            });
            this._updateDiff(earliestSha, commentSha);
        }
        else {
            this.setState({
                fromSha: commentSha,
                toSha: latestSha
            });
            this._updateDiff(commentSha, latestSha);
        }
    },

    _onPatchLineClick: function(lineId, line) {
        this.props.onLineClick(this.props.diff, lineId, line);
    },

    render: function() {
        var self = this;
        var diff = this.props.diff;
        var selDiff = this.state.selectedDiff || diff;
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
                return c.getSha() === self.state.toSha;
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

        if (this.state.showAllComments) {
            var comms = this.props.comments.filter(function(cmt) {
                return cmt.getSha() !== self.state.toSha;
            });
            // bucket comments which were made on the same commit/line
            var bucketComments = []; // array of array of line comments
            comms.forEach(function(c) {
                for (var b = 0; b < bucketComments.length; b++) {
                    var bucketComm = bucketComments[b][0];
                    if (!bucketComm) {
                        continue;
                    }
                    if (bucketComm.matches(c)) {
                        bucketComments[b].push(c);
                        return;
                    }
                }
                // if we're here then this comment isn't in a bucket so make one
                bucketComments.push([c]);
            });
            allCommentsElement = (
                <div className="FileDiffView_all_comments">
                {bucketComments.map(function(bucket) {
                    return (
                        <CommentDiffListView
                            patch={bucket[0].getPatch()}
                            comments={bucket}
                            onToggleCommits={function(cmt, wantEarlierCommits) {
                                self.setState({
                                    showAllComments: false
                                });
                                self.onToggleCommits(cmt, wantEarlierCommits);
                            }}/>
                    );
                })}

                </div>
            );
            /*
            allCommentsElement = (
                <div className="FileDiffView_all_comments">
                    {comms.map(function(cmt, i) {
                        return (
                            <CommentView comment={cmt} key={"allcmt" + i}
                                onToggleCommits={self.onToggleCommits.bind(self, cmt)}/>
                        );
                    })}
                </div>
            ); */
        }

        if (this.state.visible) {
            patchElement = (
                <PatchView
                    patch={selDiff.getPatch()}
                    comments={headComments}
                    showUnified={this.state.unified}
                    onLineComment={this._onLineComment}
                    onReplyToComment={this._onReplyToComment}
                    fileExt={selDiff.getFileExtension()}
                    onToggleCommits={self.onToggleCommits}
                    filePath={diff.getFilePathString()}
                    onLineClick={this._onPatchLineClick}/>
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
                        <a href={diff.getLink()} target="_blank">
                            {diff.getFilePathString()}
                        </a>
                    </span>
                    {visibilityButton}
                    {patchButton}
                    <div className="FileDiffView_header_counts">
                        <select className="FileDiffView_header_select_commit"
                                onChange={this.onCommitChange.bind(this, true)}
                                value={this.state.fromSha}>
                            {this.state.commits.map(function(c, i) {
                                return (
                                    <option value={c.sha}>
                                        {c.label}
                                    </option>
                                );
                            })}
                        </select>
                        <select className="FileDiffView_header_select_commit"
                                onChange={this.onCommitChange.bind(this, false)}
                                value={this.state.toSha}>
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
                            {selDiff.getAddCount()}++
                        </span>
                        <span className="FileDiffView_counts_deletions">
                            {selDiff.getRemoveCount()}--
                        </span>
                        <span className="FileDiffView_counts_changes">
                            {selDiff.getChangeCount()}
                        </span>
                    </div>
                </div>
                {allCommentsElement}
                {patchElement}
            </div>
        );
    }
});
