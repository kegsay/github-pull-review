"use strict";
var Comment = require("./models/comment");
var User = require("./models/user");


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

module.exports.getCommentsFromGithubApi = function(apiData, apiComments) {
    var comments = apiComments.body.map(function(apiComment) {
        return toComment(apiComment);
    });
    if (apiData.body) {
        // PR has a starting comment; wodge with the rest
        comments.unshift(toComment(apiData.body));
    }
    return comments;
};

module.exports.getCommitsFromGithubApi = function(apiData, apiComments) {

};
