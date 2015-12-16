"use strict";
var Promise = require("bluebird");

var marked = require("marked");
marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
});

module.exports.markdownToHtml = function(mdown) {
    return marked(mdown);
};

module.exports.timeAgo = function(ts) {
    var seconds = Math.floor((new Date() - ts) / 1000);
    var interval = Math.floor(seconds / 31536000);
    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
};

/**
 * while returns a promise which is resolved when condition() is true, repeatedly calling fn()
 * between checks of condition().
 *
 * If opt_delayMs is passed, that number of milliseconds will be waited between calls to fn.
 */
module.exports.while = function(condition, fn, opt_delayMs) {
    var delayMs = opt_delayMs || 0;
    var loop;
    var promise = new Promise((res) => {
        loop = () => {
            if (!condition()) {
                res();
                return null;
            }
            return Promise.delay(delayMs).then(fn).then(loop);
        };
    });

    process.nextTick(loop);

    return promise;
};
