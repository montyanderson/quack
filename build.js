function build(next) {
    var fs = require("fs"),
        less = require("less"),
        browserify = require("browserify");

    console.log("Building client scripts...");
    var JSbundle = fs.createWriteStream(__dirname + "/public/bundle.js");
    browserify().add(__dirname + "/client/index.js").bundle().pipe(JSbundle);

    console.log("Building stylesheets...");
    less.render(fs.readFileSync(__dirname + "/style/main.less").toString()).then(function(output) {
            fs.writeFileSync(__dirname + "/public/bundle.css", output.css);
            console.log(output);
    }, function(err) {
        console.log(err);
    });

    next();
}

module.exports = build;
