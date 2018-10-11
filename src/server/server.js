import express from "express"
import serveStatic from "serve-static"
import bodyParser from "body-parser"
import * as globalHandler from "./routes/global-handlers"
import routes from "./routes/all-routes"
import debug from "debug"
import config from "./config/config-loader"
import compression from "compression"
import autoVersion from "./helpers/auto-version"

let app = express()
let log = debug("server")
let server

function start() {
    return new Promise((resolve) => {
        server = app.listen(config.PORT, () => {
            log(`Ready @ localhost:${config.PORT} -- ${config.NODE_ENV}`)
            resolve()
        })
    })
}

function stop() {
    return new Promise((resolve) => {
        if (server) {
            server.close()
        }

        resolve()
    })
}

// settings
app.set("view engine", "pug")
app.set("views", "./src/resources/views")

// resolve cache busted files
app.locals.autoVersion = autoVersion

app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// static files
app.use(serveStatic("public", { maxAge: config.NODE_ENV === "production" ?  "10 years" : 0 }))

// routes
app.use("/", routes)

// error handler
app.use(globalHandler.error)

// 404 handler
app.use(globalHandler.notFound)

// get the party started
if (!config.NODE_ENV.includes("test")) {
    start()
}

export { start, stop, app }
