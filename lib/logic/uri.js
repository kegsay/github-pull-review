"use strict";
var qs = require("querystring");

module.exports = {
    encodeFragment: function(page, repo, id) {
        return "/" + page + "?repo=" + repo + "&pr=" + id;
    },

    decodeFragment: function(fragment) {
        if (fragment[0] === "#") {
            fragment = fragment.substring(1);
        }
        return qs.parse(fragment);
    }
}
