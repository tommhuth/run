const webpack = require("webpack") 
const { version } = require("./package.json")
const path = require("path")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const SpriteLoaderPlugin =require("svg-sprite-loader/plugin")

let plugins = [ 
    new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        "process.env.APP_VERSION": JSON.stringify(version)
    }),
    new MiniCssExtractPlugin({ allChunks: true, filename: "./css/app.bundle.css" }),
    new SpriteLoaderPlugin({ plainSprite: true }),
] 

module.exports = {
    entry: "./src/client/app.js",
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

                test: /\.svg$/,
                use: [
                    {
                        loader: "svg-sprite-loader",
                        options: {
                            extract: true,
                            spriteFilename: "/gfx/iconset.bundle.svg",
                        },
                    },
                    {
                        loader: "svgo-loader",
                        options: {
                        },
                    },
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: "sass-loader"
                    },
                ],
            },
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
