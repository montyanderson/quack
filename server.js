var fs = require("fs"),
    http = require("http"),
    less = require("less"),
    express = require("express"),
    request = require("request"),
    Mustache = require("mustache"),
    socketio = require("socket.io");

require("./build.js")();

var app = express();

app.staticFile = function(query, path) {
    app.get(query, function(req, res) {
        res.sendFile(path);
    });
};

app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
    fs.readFile(__dirname + "/public/index.mus", function(err, data) {
        if(!err) {
            res.header("Content-Type", "text/html");
            res.write(Mustache.render(data.toString(), {
                client_id: client_id,
                socketsPort: socketsPort,
                port: port
            }));

            res.end();
        }
    });
});

var server = http.createServer(app);
var io = socketio(server);

if(fs.existsSync(__dirname + "/.client_id") === true) {
    var client_id = fs.readFileSync(__dirname + "/.client_id").toString().trim();
} else {
    var client_id = process.env.CLIENT_ID;
}

if(fs.existsSync(__dirname + "/.client_secret") === true) {
    var client_secret = fs.readFileSync(__dirname + "/.client_secret").toString().trim();
} else {
    var client_secret = process.env.CLIENT_SECRET;
}

require("./sockets.js")(io, client_id, client_secret);

var ip = process.env.OPENSHIFT_INTERNAL_IP || process.env.OPENSHIFT_NODEJS_IP || "";
var port = process.env.OPENSHIFT_INTERNAL_IP || process.env.OPENSHIFT_NODEJS_PORT || process.argv[2] || 8080;

if(process.env.OPENSHIFT_INTERNAL_IP || process.env.OPENSHIFT_NODEJS_PORT) {
    var socketsPort = 8000;
} else {
    var socketsPort = port;
}

server.listen(port, ip);
