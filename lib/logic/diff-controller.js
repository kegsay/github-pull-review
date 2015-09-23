"use strict";
var apiMapper = require("./api-mapper");

function DiffController(httpApi) {
    this.httpApi = httpApi;
}

DiffController.prototype.getPullRequestDiffs = function(repo, pr) {
    return this.httpApi.getPullRequestDiffs(repo, pr).then(function(response) {
        console.log(JSON.stringify(response, undefined, 2));
        var diffList = apiMapper.getDiffsFromGithubApi(response.body);
        return diffList;
    });
};

module.exports = DiffController;
