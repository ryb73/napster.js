const path = require("path");

module.exports = {
    entry:  {
        client: path.resolve("src/client.js"),
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