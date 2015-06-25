module.exports = function() {
    $("nav > h1, .landing").each(function() {
        var html = "";

        $(this).text().split("").forEach(function(letter) {
            html += "<span class='letter'>" + letter + "</span>";
        });

        $(this).html(html);
    });
}
