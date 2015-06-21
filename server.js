var fs = require("fs"),
    http = require("http"),
    less = require("less"),
    express = require("express"),
    request = require("request"),
    Mustache = require("mustache"),
    socketio = require("socket.io");

var app = express();

app.staticFile = function(query, path) {
    app.get(query, function(req, res) {
        res.sendFile(path);
    });
};

app.use(express.static("public"));

app.staticFile("/jquery.js", require.resolve("jquery"));
app.staticFile("/mustache.js", require.resolve("mustache"));

app.get("/style.css", function(req, res) {
    fs.readFile(__dirname + "/public/style.less", function(err, data) {

        less.render(data.toString()).then(function(output) {
            res.header("Content-Type", "text/css");
            res.write(output.css);
            res.end();
        }, function(error) {
            console.log(error);
        });

    });
});

app.get("/", function(req, res) {
    fs.readFile("public/index.mus", function(err, data) {
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

if(fs.existsSync(".client_id") === true) {
    var client_id = fs.readFileSync(".client_id").toString().trim();
} else {
    var client_id = process.env.CLIENT_ID;
}

if(fs.existsSync(".client_secret") === true) {
    var client_secret = fs.readFileSync(".client_secret").toString().trim();
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
