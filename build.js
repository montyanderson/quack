function build(next) {
    var fs = require("fs"),
        less = require("less"),
        browserify = require("browserify");

    console.log("Building client scripts...");
    var JSbundle = fs.createWriteStream(__dirname + "/public/bundle.js");
    browserify().add(__dirname + "/client/index.js").bundle().pipe(JSbundle);

    console.log("Building stylesheets...");
    less.render(fs.readFileSync(__dirname + "/style/main.less").toString(), {},
        function(error, output) {
            fs.writeFileSync(__dirname + "/public/bundle.css", output.css);

    });

    next();
}

module.exports = build;