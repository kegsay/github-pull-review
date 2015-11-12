var fs = require("fs");
var http = require("http");

var headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization"
};

function handle(path, response, expandIndex) {
    fs.stat(path, function(err, stat) {
        if (err && err.code === "ENOENT") {
            return notfound(response);
        }
        if (expandIndex && stat.isDirectory()) {
            return handle(path + "/index.html", response, false);
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

var server = http.createServer((req, res) => handle(decodeURIComponent(req.url.substring(1)).replace(/ /g, "%20"), res, true));

var argv = process.argv.slice(2);
var port = argv.length ? parseInt(argv[0]) : 8002;

server.listen(port);
console.log("Listening on port %d", port);

function notfound(response) {
    response.writeHead(404, headers);
    response.write(JSON.stringify({
        message: "Not Found",
        documentation_url: "https://developer.github.com/v3"
    }));
    response.end();
}

function error(response, err) {
    console.log(err);
    response.writeHead(500, headers);
    response.write(JSON.stringify({message: "Unknown error: " + JSON.stringify(err)}));
    response.end();
}
