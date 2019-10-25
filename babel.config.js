const { browserslist } = require("./package.json")

module.exports = {
    presets: [
        "@babel/preset-react",
        [
            "@babel/preset-env",
            {
                targets: browserslist,
                debug: true,
                useBuiltIns: "usage",
                corejs: { version: 3, proposals: true }
            }
        ]
    ],
    plugins: [
        "@babel/plugin-proposal-class-properties"
    ]
}