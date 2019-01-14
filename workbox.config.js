const uuid = require("uuid")

module.exports = { 
    swSrc: "./src/sw.js", 
    swDest: "./public/sw.js", 
    templatedUrls: {
        "/": uuid.v4(),
    }, 
    maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
    globDirectory: "./public",
    globPatterns:  ["**/*.{js,css,babylon,manifest}"] 
}
