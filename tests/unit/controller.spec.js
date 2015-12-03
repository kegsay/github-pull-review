"use strict";

var Controller = require("../../lib/logic/controller");
var assert = require("selenium-webdriver/testing/assert");

describe("Controller", function() {

    var controller = new Controller(null, null, null, null);

    describe("Detects PRs", function() {
        it("Detects from URL", function() {
            var pr = controller.guessPr("https://github.com/matrix-org/matrix-doc/pull/197");
            assert(pr).not.isNull();
            assert(pr.getRepo()).equalTo("matrix-org/matrix-doc");
            assert(pr.getId()).equalTo("197");
        });

        it("Detects from text with slash", function() {
            var pr = controller.guessPr("matrix-org/matrix-doc 197");
            assert(pr).not.isNull();
            assert(pr.getRepo()).equalTo("matrix-org/matrix-doc");
            assert(pr.getId()).equalTo("197");
        });

        it("Detects from text with whitespace", function() {
            var pr = controller.guessPr("matrix-org   matrix-doc 197");
            assert(pr).not.isNull();
            assert(pr.getRepo()).equalTo("matrix-org/matrix-doc");
            assert(pr.getId()).equalTo("197");
        });
    });
});
