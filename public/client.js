var client_id = "04c3c180923f43fda166d1ba8dcc2941";

$(".login").attr("href", "https://api.instagram.com/oauth/authorize/?client_id=" +
client_id + "&redirect_uri=" + location.origin + "&response_type=code");

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
    if(location.origin == "http://quack.montyanderson.net") {
        var socket = io("http://quack.montyanderson.net:8000");
    } else {
        var socket = io(location.origin);
    }



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
        $("#chat").append(
"<span class='message'><span class='from'>" + data.from + "</span>: " + data.text + "</span>");
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
