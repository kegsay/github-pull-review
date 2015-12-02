var fs = require("fs");
var http = require("http");
var url = require("url");

var httputil = require("selenium-webdriver/http/util");
var portprober = require("selenium-webdriver/net/portprober");
var promise = require("selenium-webdriver").promise;

var stubdata = require("./stubdata");

/**
 * Stubs sets up a stub environment for running UI tests against GPR.
 *
 * It serves up GPR (assuming it has already been built), and stubs the github
 * API and supplementary API on separate ports.
 *
 * Usage:
 * Call stubs.init(driver) to configure driver to use the stub endpoints.
 * This will add a function to driver: getGprPage(path) which will navigate the
 * driver to that page in GPR, e.g. driver.getGprPage("/list").
 *
 * The public exported functions on Stubs are documented for how to configure
 * the stubs.
 */
function Stubs() {
    this.reset();
}

var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PUT"
};

Stubs.prototype.init = function(driver) {
    return promise.all([this._serveGpr(), this._serveGithub(), this._serveSupplementary()])
        .then((ports) => promise.map(ports, (port) => "http://127.0.0.1:" + port))
        .then((bases) => promise
            .all(promise.map(bases, (base) => httputil.waitForUrl(base + "/healthz")))
            .then(() => promise.fulfilled(bases))
        )
        .then((bases) => {
            driver.getHealthz = (path) => driver.get(bases[0] + "/healthz");
            driver.getGprPage = (path) => driver.get(bases[0] + "#" + path);
            driver.getHealthz();
            driver.executeScript("window.localStorage['github_api_endpoint'] = '" + bases[1] + "';");
            driver.executeScript("window.localStorage['supplementary_api_endpoint'] = '" + bases[2] + "';");
            driver.executeScript("window.localStorage['github_delays'] = '" +
                JSON.stringify({POST_MERGE_MS: 10, POST_PUSH_MS: 10}) + "';");
            driver.getHealthz();
            return promise.fulfilled();
        });
};

/**
 * Return 200 OK, and the SHA abc123 in response to the next supplementary API
 * /rewritehistory request.
 */
Stubs.prototype.queueSuccessfulRewriteHistory = function() {
    this.rewriteHistoryQueue.push(true);
};

/**
 * Return 500 Internal Server Error to the next supplementary API
 * /rewritehistory request.
 */
Stubs.prototype.queueUnsuccessfulRewriteHistory = function() {
    this.rewriteHistoryQueue.push(false);
};

/**
 * Returns the POST body of the most recent request to the passed github API
 * path as a string.
 */
Stubs.prototype.getGithubRequest = function(path) {
    return this.githubRequests[path];
};

/**
 * Have github serve the passed PR object under all of its relevant API
 * endpoint paths.
 *
 * Sample PRs can be found in ./stubdata.js
 */
Stubs.prototype.stub = function(pr) {
    var pullPage = clone(pr.pullPage)
    this.githubPathsToServe[`/repos/${pr.user}/${pr.repo}/pulls/${pr.id}`] = pullPage;
    this.githubPathsToServe[`/repos/${pr.user}/${pr.repo}/pulls/${pr.id}/commits`] = clone(pr.commitsPage);
    this.githubPathsToServe[`/repos/${pr.user}/${pr.repo}/issues/${pr.id}/comments`] = clone(pr.commentsPage);
    this.githubPathsToServe[`/repos/${pr.user}/${pr.repo}/pulls/${pr.id}/merge`] = clone(pr.mergePage);

    var mergePath = `/repos/${pr.user}/${pr.repo}/pulls/${pr.id}/merge`;
    this.mergeFunctions[mergePath] = (req, cb) => {
        pullPage.merged = true;
        pullPage.merged_by = {
            login: "someone"
        };
        var body = "";
        req.on("data", (data) => body += data);
        req.on("end", () => {
            this.githubRequests[mergePath] = body;
            cb();
        });
    }
};

/**
 * Clear all stubs and recorded data.
 */
Stubs.prototype.reset = function() {
    this.rewriteHistoryQueue = [];
    this.githubPathsToServe = {};
    this.mergeFunctions = {};
    this.githubRequests = {};

    this.githubPathsToServe["/user"] = clone(stubdata.SOME_USER);
};

Stubs.prototype._serveGpr = function() {
    var server = http.createServer(
        (req, res) => handleGprRequest(
            "build" + req.url,
            res,
            /*expandIndex=*/true
        )
    );

    var portPromise = portprober.findFreePort();
    portPromise.then((port) => { server.listen(port); });
    return portPromise;
};

Stubs.prototype._serveGithub = function() {
    var server = http.createServer(
        (req, res) => {
            var u = url.parse(req.url);
            if (u.pathname === "/healthz") {
                res.writeHead(200, headers);
                res.write("ok");
                res.end();
                return;
            }

            var mergeFunction = this.mergeFunctions[u.pathname];
            if (!mergeFunction) {
                mergeFunction = function(_, cb) { cb(); };
            }
            mergeFunction(req, () => {
                if (this.githubPathsToServe[u.pathname]) {
                    res.writeHead(200, headers);
                    res.write(JSON.stringify(this.githubPathsToServe[u.pathname]));
                    res.end();
                }
                else {
                    res.writeHead(404, headers);
                    res.write(JSON.stringify({message: "Path not found"}));
                    res.end();
                }
            });
        }
    );

    var portPromise = portprober.findFreePort();
    portPromise.then((port) => server.listen(port));
    return portPromise;
};

Stubs.prototype._serveSupplementary = function() {
    var server = http.createServer(
        (request, response) => {
            if (request.method === "OPTIONS") {
                response.writeHead(200, headers);
                response.end();
                return;
            }

            var u = url.parse(request.url);
            if (u.pathname === "/healthz") {
                response.writeHead(200, headers);
                response.write("ok");
                response.end();
            }
            else if (u.pathname === "/rewritehistory" && this.rewriteHistoryQueue.pop()) {
                response.writeHead(200, headers);
                response.write(JSON.stringify({
                    sha: "abc123",
                    message: "Success"
                }));
                response.end();
            }
            else {
                response.writeHead(500, headers);
                response.write(JSON.stringify({
                    error: "Unknown request"
                }));
                response.end();
            }
        }
    );

    var portPromise = portprober.findFreePort();
    portPromise.then((port) => {
        server.listen(port);
    });
    return portPromise;
};

function handleGprRequest(path, response, expandIndex) {
    fs.stat(path, function(err, stat) {
        if (path.length >= "/healthz".length && path.substring(path.length - "/healthz".length) === "/healthz") {
            response.writeHead(200, headers);
            response.write("ok");
            response.end();
            return;
        }
        if (err && err.code === "ENOENT") {
            notfound(response);
            return;
        }
        if (expandIndex && stat.isDirectory()) {
            handleGprRequest(path + "/index.html", response, /*expandIndex=*/false);
            return;
        }
        else if (err) {
            error(response, err);
            return;
        }
        else if (!stat.isFile()) {
            notfound(response);
            return;
        }
        fs.readFile(path, function(err2, data) {
            if (err2) {
                error(response, err2);
                return;
            }
            response.writeHead(200, headers);
            response.write(data)
            response.end();
        })
    });
}

function notfound(response) {
    response.writeHead(404, headers);
    response.write("Not found");
    response.end();
}

function error(response, err) {
    console.error(err);
    response.writeHead(500, headers);
    response.write(JSON.stringify({message: "Unknown error: " + JSON.stringify(err)}));
    response.end();
}

function clone(o) {
    return JSON.parse(JSON.stringify(o));
}

module.exports = Stubs;
