var client_id = "04c3c180923f43fda166d1ba8dcc2941";

$(".login").attr("href", "https://api.instagram.com/oauth/authorize/?client_id=" +
$("html").attr("data-client-id") + "&redirect_uri=" + location.origin + "&response_type=code");

$(".page").hide();

$(".page-login").show();

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
    var socket = io(wsURL);

    socket.emit("code", {
        code: parse("code"),
        redirect_uri: location.origin
    });

    socket.on("err", function(error) {
        //alert(error);
    });

    socket.on("login", function(username) {
        $(".username").text(username);

        $(".page").hide();
        $(".page-main").show();
    });

    socket.on("message", function(data) {
        console.log(data);
        var template = $("#template-message").html();

        for(var i = 0; i < template.split("[[").length; i++) {
            template = template.replace("[[", "{{").replace("]]", "}}");
            template = template.replace("[[", "{{").replace("]]", "}}");
        }

        if(data.text.substr(0, 1) == ">") {
            data.greentext = true;
            console.log("greentext");
        }

        $("#chat").append(Mustache.render(template, data));
        $("#chat").scrollTop($("#chat")[0].scrollHeight);
    });

    $(".text").keypress(function(event) {
        if ( event.which == 13 ) {
            var text = $(".text").val();
            $(".text").val("");
            socket.emit("message", text);
        }
    });


} else {
    alert("err");
}
