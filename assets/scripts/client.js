module.exports = function() {

    $(".login").attr("href", "https://api.instagram.com/oauth/authorize/?client_id=" +
    $("html").attr("data-client-id") + "&redirect_uri=" + location.origin + "&response_type=code");

    /* https://stackoverflow.com/questions/5448545/how-to-retrieve-get-parameters-from-javascript */

    function parse(val) {
        var result = "Not found",
            tmp = [];
        location.search
        //.replace ( "?", "" )
        // this is better, there might be a question mark inside
        .substr(1)
            .split("&")
            .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === val) result = decodeURIComponent(tmp[1]);
        });
        return result;
    }

    if(parse("code")) {
        var wsURL = location.origin.split(":" + $("html").data("port"))[0] + ":" + $("html").data("socket");
        window.socket = io(wsURL);

        socket.emit("code", {
            code: parse("code"),
            redirect_uri: location.origin
        });

        socket.on("err", function(error) {
            //alert(error);
        });

        socket.on("login", function(username) {
            window.username = username;
            $(".username").text(username);

            $(".page").hide();
            $(".page-main").show();
        });

        /*jshint multistr: true */

        var messageTemplate = " \
        <span class='message'>\
            <span class='from'>{{user}}</span>:\
            <span class='{{user}} {{#greentext}}greentext{{/greentext}} '>\
            {{text}}\
            </span>\
        </span>\
        ";

        socket.on("message", function(data) {
            if(data.text.substr(0, 1) == ">") {
                data.greentext = true;
                console.log("greentext");
            }

            $("#chat").append(Mustache.render(messageTemplate, data));
            $("#chat").scrollTop($("#chat")[0].scrollHeight);

            if(data.username !== window.username) {
                new Audio("quack.mp3").play();
            }
        });

        $("#text").keypress(function(event) {
            if (event.which == 13) {
                var text = $(this).val();
                $(this).val("");
                socket.emit("message", text);
            }
        });

        /* rooms */

        $("#room").keypress(function(event) {
            if(event.which == 13) {
                socket.emit("room", $(this).val());
            }
        });

        socket.on("room", function(room) {
            window.room = room;
            $("#chat").text("");
        });

    }

};
