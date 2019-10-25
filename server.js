const express = require("express")
const serveStatic = require("serve-static")
const path = require("path")
const compression = require("compression") 

const PORT = process.env.PORT || "3000"
const NODE_ENV = process.env.NODE_ENV || "development" 

const app = express()

app.use(compression())
app.use(serveStatic(path.join(__dirname, "public"), { maxAge: "10 years"  }))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"))
})

app.listen(PORT, () => {
    console.log(`[${NODE_ENV}] Server ready @ localhost:${PORT}`)
})