var fs = require("fs");
var http = require("http");
var url = require("url");

var httputil = require("selenium-webdriver/http/util");
var portprober = require("selenium-webdriver/net/portprober");
var promise = require("selenium-webdriver").promise;

var stubdata = require("./stubdata");

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
                JSON.stringify({POST_MERGE: 10, POST_PUSH: 10}) + "';");
            driver.getHealthz();
            return promise.fulfilled();
        });
};

Stubs.prototype.queueSuccessfulRewriteHistory = function() {
    this.rewriteHistoryQueue.push(true);
};

Stubs.prototype.queueUnsuccessfulRewriteHistory = function() {
    this.rewriteHistoryQueue.push(false);
};

Stubs.prototype.queueSuccessfulSquashMerge = function() {
    this.squashMergeQueue.push(true);
};

Stubs.prototype.getGithubRequest = function(path) {
    return this.githubRequests[path];
};

Stubs.prototype.stub = function(pr) {
    var pullPage = clone(pr.pullPage)
    this.githubPathsToServe["/repos/" + pr.user + "/" + pr.repo + "/pulls/" + pr.id] = pullPage;
    this.githubPathsToServe["/repos/" + pr.user + "/" + pr.repo + "/pulls/" + pr.id + "/commits"] = clone(pr.commitsPage);
    this.githubPathsToServe["/repos/" + pr.user + "/" + pr.repo + "/issues/" + pr.id + "/comments"] = clone(pr.commentsPage);
    this.githubPathsToServe["/repos/" + pr.user + "/" + pr.repo + "/pulls/" + pr.id + "/merge"] = clone(pr.mergePage);

    var mergePath = "/repos/" + pr.user + "/" + pr.repo + "/pulls/" + pr.id + "/merge";
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

Stubs.prototype.reset = function() {
    this.rewriteHistoryQueue = [];
    this.squashMergeQueue = [];
    this.mergeQueue = [];
    this.githubPathsToServe = {};
    this.mergeFunctions = {};
    this.githubRequests = {};

    this.githubPathsToServe["/user"] = clone(stubdata.SOME_USER);
};

Stubs.prototype._serveGpr = function() {
    var server = http.createServer(
        (req, res) => handle(
            "../build" + req.url,
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
                mergeFunction = function(req, cb) { cb(); };
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
            else if ((u.pathname === "/squashmerge" && this.squashMergeQueue.pop()) ||
                (u.pathname === "/rewritehistory" && this.rewriteHistoryQueue.pop())) {
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

function handle(path, response, expandIndex) {
    fs.stat(path, function(err, stat) {
        if (path.length >= "/healthz".length && path.substring(path.length - "/healthz".length) === "/healthz") {
            response.writeHead(200, headers);
            response.write("ok");
            response.end();
            return;
        }
        if (err && err.code === "ENOENT") {
            return notfound(response);
        }
        if (expandIndex && stat.isDirectory()) {
            return handle(path + "/index.html", response, /*expandIndex=*/false);
        } else if (err) {
            return error(response, err);
        } else if (!stat.isFile()) {
            return notfound(response);
            return;
        }
        fs.readFile(path, function(err, data) {
            if (err) {
                return error(response, err);
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
