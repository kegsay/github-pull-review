var React = require("react");
var PatchView = require("./patch-view");
var CommentDiffListView = require("./comment-diff-list-view");

function CommitLabel(sha, label) {
    this.label = label;
    this.sha = sha;
}

function scrollToAnchor(anchorId) {
    var element = document.querySelector(`#${anchorId}`);
    if (element) {
        element.scrollIntoView();
    }
}

module.exports = React.createClass({displayName: 'FileDiffView',

    propTypes: {
        onReplyToComment: React.PropTypes.func.isRequired,
        onLineComment: React.PropTypes.func.isRequired,
        pr: React.PropTypes.any.isRequired,
        comments: React.PropTypes.array, // nullable (not yet loaded)
        diff: React.PropTypes.any.isRequired,
        controller: React.PropTypes.any.isRequired,
        onLineClick: React.PropTypes.func, // fn(FileDiff, lineId: String, Line)
        onCommentClick: React.PropTypes.func, // fn(FileDiff, Comment, commentAnchorId)
        anchorId: React.PropTypes.string
    },

    getDefaultProps: function() {
        return {
            onLineClick: function() {},
            onCommentClick: function() {}
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
        this._goToAnchor(this.props.anchorId, this.props.pr, this.props.comments);
    },

    componentDidUpdate: function(prevProps, prevState) {
        // loaded the right diff, have loaded comments (not null), have an anchor
        if (this.state.selectedDiff && this.props.comments !== null && this._pendingAnchorId) {
            scrollToAnchor(this._pendingAnchorId);
            this._pendingAnchorId = null;
        }
    },

    componentWillReceiveProps: function(nextProps) {
        this._setCommitList(nextProps.pr, nextProps.comments);
        this._goToAnchor(this.props.anchorId, nextProps.pr, nextProps.comments);
    },

    _goToAnchor: function(anchorId, pr, comments) {
        if (!anchorId) { return; }
        comments = comments || [];
        var fromSha = pr.getDest().getSha();
        var toSha;
        console.log("BASE=%s HEAD=%s", pr.getDest().getSha(), pr.getSource().getSha());

        // TODO: It's a bit ming that we need to know how the anchor is formed from PatchView.
        // We need to know it to set the right base/head commits, but the PatchView needs to
        // know it to set the <element id=... />
        if (anchorId.indexOf("cmt-") === 0) {
            var cmtId = anchorId.substring("cmt-".length);
            // line comment - find the comment if we can
            var lineComment = comments.filter(function(c) {
                // cast to string because javascript will interpret the ID as a number..
                return String(c.getComment().getId()) === cmtId;
            })[0];
            if (!lineComment) {
                return; // another file-diff-view will probably find this
            }
            // set the base/head shas according to the line comment
            toSha = lineComment.getSha();
        }
        else if (anchorId.indexOf("diff-") === 0) {
            // line number, of form "diff-FROMSHA-TOSHA-FILEANDNUM"
            var [a, aFrom, aTo, aFile] = anchorId.split("-"); //eslint-disable-line no-unused-vars
            if (!aFrom || !aTo || !aFile) {
                return;
            }
            toSha = aTo;
            fromSha = aFrom;
        }

        // DO IT!
        if (toSha === pr.getSource().getSha() && fromSha === pr.getDest().getSha()) {
            // to sha is HEAD, so we don't need to get a diff. Go to anchor immediately.
            console.log("Navigating to BASE->HEAD anchor");
            // force update to make sure that the comments have rendered and so the
            // <div id=...> is in the DOM
            this.forceUpdate(function() {
                scrollToAnchor(anchorId);
            });
            return;
        }

        this.setState({
            fromSha: fromSha,
            toSha: toSha
        });
        this._updateDiff(fromSha, toSha);
        // FIXME: This is ming. We set this then check for it in componentDidUpdate to scroll.
        // It would be much nicer if the control flow could remain inside this function call.
        this._pendingAnchorId = anchorId;
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
        comments = comments || [];
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
        console.log(
            "%s: %s comments, %s commits", this.props.diff.getFilePathString(),
            comments.length, commits.length
        );
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
                    console.log("Bad from sha. Given %s but %s is the toSha.",
                        newSha, this.state.toSha)
                    break;
                }
                else if (this.state.commits[i].sha === newSha) {
                    break;
                }
            }
            if (!badSha) {
                console.log("%s from SHA = %s", this.props.diff.getFilePathString(), newSha);
                this.setState({fromSha: newSha});
                this._updateDiff(newSha, this.state.toSha);
            }
        }
        else {
            // make sure the new sha isn't <= the from sha
            for (i = this.state.commits.length - 1; i >= 0; i--) {
                if (this.state.commits[i].sha === this.state.fromSha) {
                    badSha = true;
                    console.log("Bad to sha. Given %s but %s is the fromSha.",
                        newSha, this.state.fromSha)
                    break;
                }
                else if (this.state.commits[i].sha === newSha) {
                    break;
                }
            }
            if (!badSha) {
                console.log("%s to SHA = %s", this.props.diff.getFilePathString(), newSha);
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

    _onCommentClick: function(comment, anchorId) {
        this.props.onCommentClick(this.props.diff, comment, anchorId);
    },

    render: function() {
        var self = this;
        var diff = this.props.diff;
        var commentList = this.props.comments || [];
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
        if (commentList.length > 0) {
            headComments = commentList.filter(function(c) {
                return c.getSha() === self.state.toSha;
            });

            commentCount = (
                <span className="FileDiffView_counts_comments">
                    {headComments.length} comments ({commentList.length} total)
                </span>
            );

            if (headComments.length < commentList.length) {
                otherCommentsButton = (
                    <button className="FileDiffView_all_comments_button"
                        onClick={this.toggleAllComments}>
                        {otherCommentsText}
                    </button>
                );
            }
        }

        if (this.state.showAllComments) {
            var comms = commentList.filter(function(cmt) {
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
                    onLineClick={this._onPatchLineClick}
                    onCommentClick={this._onCommentClick}
                    fromCommitSha={this.state.fromSha}
                    toCommitSha={this.state.toSha} />
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
