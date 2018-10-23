const express = require("express")
const serveStatic = require("serve-static")
const path = require("path")
const compression = require("compression")
const { version } = require("./package.json")

const PORT = process.env.PORT || "3000"
const NODE_ENV = process.env.NODE_ENV || "local"
const USE_CACHE_BUST = process.env.USE_CACHE_BUST === "true" 

const app = express()

app.use(compression())
app.use(serveStatic(path.join(__dirname, "public"), { maxAge: USE_CACHE_BUST ? "1 year" : 0 }))
app.use(serveStatic(path.join(__dirname, "assets/style"), { maxAge: USE_CACHE_BUST ? "1 year" : 0 }))
app.use(serveStatic(path.join(__dirname, "assets/models"), { maxAge: USE_CACHE_BUST ? "1 year" : 0 }))
app.set("views", path.join(__dirname, "assets/views"))
app.set("view engine", "pug")

app.locals.autoVersion = function (path) {
    if (NODE_ENV !== "production") {
        return path
    }

    return `${path}?=v${version}`
}

app.get("/", (req, res) => {
    res.render("app")
})

app.listen(PORT, () => {
    console.log(`[${NODE_ENV}] Server ready @ ${PORT}`)
})
