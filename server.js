var fs = require("fs"),
    http = require("http"),
    less = require("less"),
    express = require("express"),
    request = require("request"),
    socketio = require("socket.io");

var app = express();

app.use(express.static("public"));

app.get("/style.css", function(req, res) {
    fs.readFile(__dirname + "/public/style.less", function(err, data) {

        less.render(data.toString()).then(function(output) {
            res.write(output.css);
            res.end();
        }, function(error) {
            console.log(error);
        });

    });
});

var server = http.createServer(app);
var io = socketio(server);

var client_id = "04c3c180923f43fda166d1ba8dcc2941";
var client_secret = process.env.CLIENT_SECRET;

io.on("connection", function(socket) {
    var access_token = false;
    var username = false;

    socket.on("code", function(data) {
        request.post({
            url:'https://api.instagram.com/oauth/access_token',
            form: {
                client_id: client_id,
                client_secret: client_secret,
                code: data.code,
                redirect_uri: data.redirect_uri,
                grant_type: "authorization_code"
            }},
        function(err, httpResponse, body) {
            if(body && JSON.parse(body).user != undefined) {
                var response = JSON.parse(body);

                access_token = response.access_token;
                username = response.user.username;
                socket.emit("login", username);

                console.log(username);
            } else {
                socket.emit("err", "Error! Failed to login!");
            }
        });
    });

    socket.on("message", function(text) {
        if(username !== false && text.length < 51) {
            io.emit("message", {
                from: username,
                text: text
            });
        }
    });

});

server.listen(8080);
