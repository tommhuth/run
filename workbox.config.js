const uuid = require("uuid")
const { version } = require("./package.json")

module.exports = { 
    swSrc: "./public/sw.bundle." + version + ".js", 
    swDest: "./public/sw.js", 
    templatedUrls: {
        "/": uuid.v4(),
    }, 
    maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
    globDirectory: "./",
    globPatterns:  ["./public/**/*.{js,css,babylon,manifest}"] 
}
