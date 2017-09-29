const path = require("path");

module.exports = {
    entry:  {
        napster: path.resolve("src/napster.js"),
        "example/client": path.resolve("example/client.js"),
    },

    output: {
        path: path.resolve("lib/"),
        filename: "[name].js",
    },

    module: {
        rules: [{
            test: /\.js$/,
            use: "babel-loader"
        }],
    },
};