module.exports = function(io, client_id, client_secret) {
    var request = require("request");

    var users = [];

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
                if(body && JSON.parse(body).user !== undefined) {
                    var response = JSON.parse(body);

                    access_token = response.access_token;
                    username = response.user.username;

                    users.push(username);
                    io.emit("users", users);

                    socket.emit("login", username);

                    io.emit("message", {
                        user: username,
                        text: "joined"
                    });
                } else {
                    socket.emit("err", "Error! Failed to login!");
                }
            });
        });

        socket.on("message", function(text) {
            if(username !== false && text.length < 51 && text.trim() !== "") {
                io.emit("message", {
                    user: username,
                    text: text
                });
            }
        });

        socket.on("disconnect", function() {
            var index = users.indexOf(username);
            users.splice(index, 1);
            io.emit("users", users);
        });

    });
}
