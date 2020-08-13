const webpack = require("webpack")
const path = require("path")
const uuid = require("uuid")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const WebpackPwaManifest = require("webpack-pwa-manifest")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const { InjectManifest } = require("workbox-webpack-plugin")
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer")

const rev = uuid.v4()
const plugins = [
    //new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
        "process.env.REGISTER_SERVICEWORKER": JSON.stringify(process.env.REGISTER_SERVICEWORKER),
        "process.env.BUILD_TIME": JSON.stringify(new Date().toISOString())
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
                from: path.join(__dirname, "assets", "splashscreens/*.png"),
                to: "splashscreens/[name]." + rev + ".[ext]"
            }
        ]
    ),
    new WebpackPwaManifest({
        name: "Run",
        short_name: "Run",
        background_color: "#FBFF64",
        theme_color: "#FBFF64",
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
    //new BundleAnalyzerPlugin()
]

module.exports = (env, options) => {
    if (options.mode === "production") {
        plugins.push(new InjectManifest({
            swSrc: "./src/serviceworker.js",
            swDest: "serviceworker.js",
            exclude: ["serviceworker.js"],
        }))
    }

    return {
        entry: { app: "./src/app.js" },
        devtool: options.mode === "development" ? "eval-cheap-module-source-map" : false,
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
                {
                    test: /\.glsl$/,
                    loader: "webpack-glsl-loader"
                },
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
        plugins
    }
}