const webpack = require("webpack")
const path = require("path")
const uuid = require("uuid")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const WebpackPwaManifest = require("webpack-pwa-manifest")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const { InjectManifest } = require("workbox-webpack-plugin")

module.exports = (env, options) => {
    const rev = uuid.v4()
    const plugins = [
        new webpack.DefinePlugin({
            "process.env.REGISTER_SERVICEWORKER": JSON.stringify(process.env.REGISTER_SERVICEWORKER),
            "process.env.BUILD_TIME": JSON.stringify(new Date().toISOString())
        }),
        new MiniCssExtractPlugin({
            filename: "css/[name].[contenthash:6].css"
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "assets/views", "index.html"),
            filename: "index.html",
            rev
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.join(__dirname, "assets", "splashscreens"),
                    to: "splashscreens/[name]." + rev + ".[ext]"
                },
                {
                    from: path.join(__dirname, "assets", "models"),
                    to: "models/[name].[ext]"
                } 
            ]
        }),
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
            filename: "./manifest-[contenthash:6].json",
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
        })
    ] 

    if (!options.watch) {
        plugins.push(new InjectManifest({
            swSrc: "./src/serviceworker.js",
            swDest: "serviceworker.js",
            exclude: ["serviceworker.js"], 
        }))
    }

    return {
        entry: { app: "./src/app.js" },
        output: {
            path: path.resolve(__dirname, "public"),
            filename: "[name].bundle.[contenthash:6].js",
            publicPath: "/"
        },
        stats: {
            hash: false,
            version: false,
            timings: false,
            children: false,
            cached: false,
            errors: true,
            assetsSpace: 1,
        },
        module: {
            rules: [
                {
                    test: /\.glsl$/,
                    loader: "webpack-glsl-loader"
                },
                { test: /\.json$/, loader: "json" },
                {
                    test: /\.js$/,
                    exclude: /node_modules\/(?!(@huth)\/).*/,
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
                                postcssOptions: {
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
}