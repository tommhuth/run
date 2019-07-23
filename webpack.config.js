 
const webpack = require("webpack")
const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")  

let plugins = [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({   }), 
    new MiniCssExtractPlugin({
        filename: "css/[name].[hash:6].css"
    }),
    new HtmlWebpackPlugin({
        template: path.join(__dirname, "assets/views", "index.html"),
        filename: "index.html"
    }),  
    //new BundleAnalyzerPlugin()
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
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: "babel-loader"
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]
            },
            {
                test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
                use: [{
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        outputPath: "fonts/"
                    }
                }]
            },
        ]
    },
    resolve: {
        extensions: [".js"] 
    }, 
    plugins,
}
