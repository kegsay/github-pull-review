"use strict";

module.exports.getCommentsFromGithubApi = function(apiData, apiComments) {
    var comments = apiComments.body.map(function(apiComment) {
        return {
            body: apiComment.body,
            by: apiComment.user.login,
            by_url: apiComment.user.html_url,
            ts: new Date(apiComment.created_at),
            avatar: apiComment.user.avatar_url
        };
    });
    if (apiData.body) {
        // PR has a starting comment; wodge with the rest
        comments.unshift({
            body: apiData.body.body,
            by: apiData.body.user.login,
            by_url: apiData.body.user.html_url,
            ts: new Date(apiData.body.created_at),
            avatar: apiData.body.user.avatar_url
        });
    }
    return comments;
};

module.exports.getCommitsFromGithubApi = function(apiData, apiComments) {

};
