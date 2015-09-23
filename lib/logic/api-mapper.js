"use strict";
var Comment = require("./models/comment");
var User = require("./models/user");
var Commit = require("./models/commit");

function toComment(obj) {
    var usr = new User(
        obj.user.login,
        obj.user.avatar_url,
        obj.user.html_url
    );
    return new Comment(
        obj.id, usr, obj.body, new Date(obj.created_at)
    );
}

function toCommit(obj) {
    return new Commit(
        obj.sha,
        obj.commit.message,
        new Date(obj.commit.author.date),
        obj.html_url,
        new User(
            obj.author.login, obj.author.avatar_url, obj.author.html_url
        )
    );
}

module.exports.getCommentsFromGithubApi = function(apiComments, apiData) {
    var comments = apiComments.map(function(apiComment) {
        return toComment(apiComment);
    });
    if (apiData) {
        // PR has a starting comment; wodge with the rest
        comments.unshift(toComment(apiData));
    }
    return comments;
};

module.exports.getCommitsFromGithubApi = function(apiCommits, apiData) {
    // apiCommits is an array of objects (age order, last = newest) with keys like:
    // .sha => commit hash
    // .html_url => HTML url for this commit
    // .commit.message => commit message
    // .commit.author.[name/email/date] => stuff from git config
    // .author.[login/avatar_url] => the github user
    // .committer.[login/avatar_url] => the github user

    // latest commit is apiData.head.sha
    // base commit (when branched) is apiData.base.sha
    return {
        head: apiData.head.sha,
        base: apiData.base.sha,
        commits: apiCommits.map(function(c) {
            return toCommit(c);
        })
    };
};

module.exports.getCommitDiffsFromGithubApi = function(apiCommitDiffs) {
    // the /compare endpoint also has other guff like the commits made but for
    // diffing purposes we don't give a damn.
    return module.exports.getDiffsFromGithubApi(apiCommitDiffs.files);
};

module.exports.getDiffsFromGithubApi = function(apiDiffs) {
    // apiDiffs is an array of objects (files, no real order) with keys like:
    // .filename => Path to the file from root
    // .status => enum[renamed|modified|added] (deleted too?)
    // .additions => Number of lines added
    // .deletions => Number of lines removed
    // .changes => Number of lines changed (== additions for new files)
    // .patch => patch string to apply to the file
    // .sha => SHA for...?
    return [];
};

module.exports.getLineCommentsFromGithubApi = function(apiLineComments) {
    // apiLineComments is an array of objects (age order, last = newest) with
    // keys like:
    // .id => Line comment ID
    // .html_url => HTML url for this comment
    // .diff_hunk => multi-line string with the diff (last line being the comment line)
    // .path => Path from root to the file being commented on
    // .user.[login/avatar_url] => the github user making the comment
    // .body => Comment body
    // .original_commit_id => The commit sha when this comment was made.
    // .commit_id => The HEAD commit for this PR (same for all comments)
}
