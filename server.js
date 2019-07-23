const express = require("express")
const serveStatic = require("serve-static")
const path = require("path")
const compression = require("compression") 

const PORT = process.env.PORT || "3000"
const NODE_ENV = process.env.NODE_ENV || "local"
const USE_CACHE_BUST = process.env.NO_CACHE_BUST !== "true" && NODE_ENV === "production"

const app = express()

app.use(compression())

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"))
})

app.use(serveStatic(path.join(__dirname, "public"), { maxAge: USE_CACHE_BUST ? "1 year" : 0 }))


app.listen(PORT, () => {
    console.log(`[${NODE_ENV}] Server ready @ ${PORT}`)
})