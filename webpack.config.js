const webpack = require("webpack")
const path = require("path")
const uuid = require("uuid")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const WebpackPwaManifest = require("webpack-pwa-manifest")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const { InjectManifest } = require("workbox-webpack-plugin")

const rev = uuid.v4()
const plugins = [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
        "process.env.REGISTER_SERVICEWORKER": JSON.stringify(process.env.REGISTER_SERVICEWORKER)
    }),
    new MiniCssExtractPlugin({
        filename: "css/[name].[hash:6].css"
    }),
    new HtmlWebpackPlugin({
        template: path.join(__dirname, "assets/views", "index.html"),
        filename: "index.html",
        rev
    }),
    new CopyWebpackPlugin(
        [
            {
                from: path.join(__dirname, "assets", "splashscreens"),
                to: "splashscreens/[name]." + rev + ".[ext]"
            }
        ]
    ),
    new WebpackPwaManifest({
        name: "React boilplate",
        short_name: "React boilplate",
        background_color: "#FFF",
        theme_color: "#000",
        orientation: "portrait",
        start_url: "/",
        display: "fullscreen",
        inject: true,
        ios: {
            "apple-mobile-web-app-status-bar-style": "black-translucent"
        },
        filename: "./manifest-[hash:6].json",
        icons: [
            {
                src: path.join("assets", "icons/pwa-icon.png"),
                destination: "images",
                sizes: [192, 512]
            },
            {
                src: path.join("assets", "icons/pwa-icon.png"),
                destination: "images",
                ios: true,
                sizes: [120, 180]
            }
        ]
    }),
    new InjectManifest({
        swSrc: "./src/serviceworker.js",
        swDest: "serviceworker.js",
        exclude: ["serviceworker.js", "index.html"],
        templatedURLs: {
            "/": uuid.v4()
        }
    })
]

module.exports = {
    entry: { app: "./src/app.js" },
    output: {
        path: path.resolve(__dirname, "public"),
        filename: "[name].bundle.[hash:6].js",
        publicPath: "/"
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
                exclude: /node_modules\/(?!(@huth\/utils)\/).*/,
                loader: "babel-loader"
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    "css-loader", // translates CSS into CommonJS
                    {
                        loader: "postcss-loader",
                        options: {
                            sourceMap: false,
                            config: {
                                path: "postcss.config.js"
                            }
                        }
                    },
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]
            }
        ]
    },
    resolve: {
        extensions: [".js"]
    },
    plugins,
}