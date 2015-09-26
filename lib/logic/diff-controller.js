"use strict";
var Promise = require("bluebird");
var apiMapper = require("./api-mapper");

function DiffController(httpApi) {
    this.httpApi = httpApi;
    this._diffCache = {};
}

DiffController.prototype.getPullRequestDiffs = function(repo, pr, allowCached) {
    var self = this;
    var cacheKey = repo + pr;
    if (allowCached && this._diffCache[cacheKey]) {
        return Promise.resolve(this._diffCache[cacheKey]);
    }

    return this.httpApi.getPullRequestDiffs(repo, pr).then(function(response) {
        var diffList = apiMapper.getDiffsFromGithubApi(response.body);
        self._diffCache[cacheKey] = diffList;
        return diffList;
    });
};

module.exports = DiffController;
