var key = require("selenium-webdriver").Key;

function keysToDelete(str) {
    var ret = "";
    for (var i = 0; i < str.length; ++i) {
        ret += key.BACK_SPACE;
    }
    return ret;
}

module.exports = {
    keysToDelete: keysToDelete
};
