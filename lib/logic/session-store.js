"use strict";
var ID_ACCESS_TOKEN = "SessionStore_access_token";
var ID_REPO_ID = "SessionStore_repo_id";
var ID_REQUEST_ID = "SessionStore_request_id";

function SessionStore(storageInterface) {
    this.store = storageInterface;
}

SessionStore.prototype.getAccessToken = function() {
    return this.store.getItem(ID_ACCESS_TOKEN);
};

SessionStore.prototype.getRepositoryId = function() {
    return this.store.getItem(ID_REPO_ID);
};

SessionStore.prototype.getRequestId = function() {
    return this.store.getItem(ID_REQUEST_ID);
};

SessionStore.prototype.getGithubApiEndpoint = function() {
    return this.store.getItem("github_api_endpoint") || "https://api.github.com";
};

SessionStore.prototype.getSupplementaryApiEndpoint = function() {
    return this.store.getItem("supplementary_api_endpoint") || "https://review.rocks";
};

SessionStore.prototype.getGithubDelays = function() {
    // All values are ms
    var str = this.store.getItem("github_delays");
    return str ? JSON.parse(str) : {
        POST_MERGE: 1000,
        POST_PUSH: 200
    };
};


SessionStore.prototype.setAccessToken = function(token) {
    this.store.setItem(ID_ACCESS_TOKEN, token);
};

SessionStore.prototype.setRepositoryId = function(repoId) {
    this.store.setItem(ID_REPO_ID, repoId);
};

SessionStore.prototype.setRequestId = function(reqId) {
    this.store.setItem(ID_REQUEST_ID, reqId);
};

module.exports = SessionStore;
