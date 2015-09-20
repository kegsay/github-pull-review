"use strict";

function Controller(dispatcher, httpApi) {
    this.dispatcher = dispatcher;
    this.httpApi = httpApi;
}

Controller.prototype.init = function() {
    this.dispatcher.register(this.onAction.bind(this));
}

Controller.prototype.onAction = function(payload) {
    switch (payload.action) {
        case "view_pr":
            this.httpApi.getPullRequests(payload.data.repo_id);
            break;
    }
};

module.exports = Controller;
