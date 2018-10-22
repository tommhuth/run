const webpack = require("webpack") 
const { version } = require("./package.json")
const path = require("path") 

let plugins = [ 
    new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        "process.env.APP_VERSION": JSON.stringify(version)
    }),
] 

module.exports = {
    entry: "./src/app.js",
    output: {
        path: path.resolve(__dirname, "public"),
        filename: "js/client.bundle.js"
    },

    stats: { 
        hash: false, 
        version: false, 
        timings: false, 
        children: false, 
        errors: true, 
    },
    module: {
        rules: [
            { test: /\.json$/, loader: "json" },  
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: "babel-loader" 
            },
        ]
    },
    resolve: {
        extensions: [ ".js"]
    },
    plugins
}
