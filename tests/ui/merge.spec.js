"use strict";

var Stubs = require("./stubs");
var stubdata = require("./stubdata");

var webdriver = require("selenium-webdriver");
var By = require("selenium-webdriver").By;
var until = require("selenium-webdriver").until;
var test = require("selenium-webdriver/testing");
var assert = require("selenium-webdriver/testing/assert");

var utils = require("./utils");

test.describe("Merge page", function() {
    this.timeout(5000);

    var driver;
    var stubs;

    test.beforeEach(() => {
        stubs = new Stubs();
        driver = new webdriver.Builder()
            .forBrowser("chrome")
            .build();
        driver.manage().timeouts().implicitlyWait(200)
            .then(() => stubs.init(driver));
    });

    test.afterEach((done) => driver.quit().then(done));

    test.describe("squash merging rewriting history", () => {
        test.it("succeeds", () => {
            stubs.stub(stubdata.MERGABLE_PR);

            tryRewriteMerge("someone/some-repo/1", "PR title");
            stubs.queueSuccessfulRewriteHistory();
            driver.wait(until.elementLocated(By.className("PullRequestOverview_state_merged")), 500);
            driver.findElement(By.className("PullRequestOverview_state_merged")).getText()
                .then((text) => assert(text).equalTo("Merged"));
        });

        test.it("handles errors", () => {
            stubs.stub(stubdata.MERGABLE_PR);

            tryRewriteMerge("someone/some-repo/1", "PR title");
            stubs.queueUnsuccessfulRewriteHistory();
            driver.wait(until.elementLocated(By.className("MergeButton_error")), 500);
            driver.findElement(By.className("MergeButton_error")).getText()
                .then((text) => assert(text).equalTo("Error merging"));
        });

        test.it("uses specified commit message", () => {
            stubs.stub(stubdata.MERGABLE_PR);

            driver.getGprPage("/repos/someone/some-repo/1/merge");
            stubs.queueSuccessfulRewriteHistory();
            driver.findElement(By.css(".MergeOptionContainer > span.link:nth-of-type(1)")).click();
            driver.findElement(By.tagName("textarea")).sendKeys(
                utils.keysToDelete("PR title"), "my commit message"
            );
            stubs.queueSuccessfulRewriteHistory();
            driver.findElement(By.className("MergeButton_mergable")).click();
            driver.wait(until.elementLocated(By.className("PullRequestOverview_state_merged")), 500)
                .then(() => {
                    var body = JSON.parse(stubs.getGithubRequest("/repos/someone/some-repo/pulls/1/merge"));
                    assert(body.commit_message).equalTo("my commit message");
                });
        });

        function tryRewriteMerge(pr, expectCommitMessage) {
            driver.getGprPage("/repos/" + pr + "/merge");
            driver.findElement(By.css(".MergeOptionContainer > span.link:nth-of-type(1)")).click();
            driver.findElement(By.tagName("textarea")).getText()
                .then((text) => assert(text).equalTo(expectCommitMessage));
            driver.findElement(By.className("MergeButton_mergable")).click();
            driver.findElement(By.className("MergeButton_merging")).getText()
                .then((text) => assert(text).equalTo("Merging..."));
        }
    });
});
