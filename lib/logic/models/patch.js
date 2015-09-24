"use strict";

function Patch(patchStr) {
    this.raw = patchStr;
}

Patch.prototype.getRaw = function() {
    return this.raw;
}

module.exports = Patch;
