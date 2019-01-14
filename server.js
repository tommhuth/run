const express = require("express")
const serveStatic = require("serve-static")
const path = require("path")
const compression = require("compression")
const { version } = require("./package.json")

const PORT = process.env.PORT || "3000"
const NODE_ENV = process.env.NODE_ENV || "local"
const USE_CACHE_BUST = process.env.USE_CACHE_BUST === "true" 

const app = express()

app.get("/sw.js", (req, res) => {
    res.sendFile(path.join(__dirname, "public/sw.js"), { maxAge: 0 })
})

app.use(compression())
app.use(serveStatic(path.join(__dirname, "public"), { maxAge: USE_CACHE_BUST ? "10 years" : 0 })) 
app.set("views", path.join(__dirname, "assets/views"))
app.set("view engine", "pug")

app.locals.autoVersion = function (filename) {
    const type = filename.lastIndexOf(".")

    return filename.substring(0, type) + "." + version + filename.substring(type)
}

app.get("/", (req, res) => { 
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate")
    res.header("Expires", "-1")
    res.header("Pragma", "no-cache")
    res.render("app")
})

app.listen(PORT, () => {
    console.log(`[${NODE_ENV}] Server ready @ ${PORT}`)
})
