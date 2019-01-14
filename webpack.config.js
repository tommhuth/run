const webpack = require("webpack") 
const { version } = require("./package.json")
const path = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")


let plugins = [ 
    new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        "process.env.APP_VERSION": JSON.stringify(version)
    }),
    new CopyWebpackPlugin([
        { from: "./assets/models/world.babylon.manifest", to: "./models/world." + version + ".babylon.manifest" },
        { from: "./assets/models/world.babylon", to: "./models/world." + version + ".babylon" },
        { from: "./assets/style/app.css", to: "./css/app." + version + ".css" },        
    ])
] 

module.exports = {
    entry: {
        "js/client": "./src/app.js"
    },
    output: {
        path: path.resolve(__dirname, "public"),
        filename: `[name].bundle.${version}.js`
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
