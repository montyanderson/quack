var request = require("request");

module.exports = function(io, config, client_id, client_secret) {
    io.on("connection", function(socket) {
        var access_token;
        var username;
        var room;
        var rooms = [];
        rooms["main"] = [];

        socket.on("code", function(data) {
            request.post({
                url: "https://api.instagram.com/oauth/access_token",
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

                    init();
                } else {
                    socket.emit("err", "Error! Failed to login!");
                }
            });
        });

        function init() {
            room = "main";
            socket.join(room);

            io.emit("login", username);

            io.emit("message", {user: "server", text: username + " joined."});
            socket.emit("message", {user: "server", text: "Now talking in room '" + room + "'."});
            socket.emit("message", {user: "server", text: "Do /rooms to see all rooms."});

            rooms[room].push(username);
            socket.emit("message", {user: "server", text: "Users online (in current room): " + rooms[room].join(", ") + "."});

            socket.on("message", function(text) {
                if(text == "/rooms") {
                    var onlineRooms = [];

                    for(var key in rooms) {
                        if (key === 'length' || !rooms.hasOwnProperty(key)) continue;
                        onlineRooms.push(key);
                    }

                    socket.emit("message", {user: "server", text: "Rooms online: " + onlineRooms.join(",") + "."});
                } else if(text.length <= config.messageLength && text.trim() !== "") {
                    io.to(room).emit("message", {
                        user: username,
                        text: text
                    });
                }
            });

            socket.on("room", function(data) {
                data = data.toString();

                if(/^\w+$/.test(data) === true && data.length <= config.roomLength) {
                    room = data;
                    socket.join(room);
                    socket.emit("message", {user: "server", text: "Now talking in room '" + room + "'."});

                    if(!rooms[room]) {
                        rooms[room] = [];
                    }

                    rooms[room].push(username);
                    socket.emit("message", {user: "server", text: "Users online: " + rooms[room].join(", ") + "."});
                } else {
                    socket.emit("message", {user: "server", text: "Please use alpha-numeric characters for room names."});
                }
            });

            socket.on("disconnect", function() {
                var index = rooms[room].indexOf(username);

                if (index > -1) {
                    rooms[room].splice(index, 1);
                }


            });
        }

    });
};
