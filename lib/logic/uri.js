"use strict";
var qs = require("querystring");

module.exports = {
    encodeFragment: function(repo, id) {
        return "repo=" + repo + "&pr=" + id;
    },

    decodeFragment: function(fragment) {
        if (fragment[0] === "#") {
            fragment = fragment.substring(1);
        }
        return qs.parse(fragment);
    }
}
