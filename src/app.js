// polyfill
import "../assets/styles/app.scss"

import { Workbox } from "workbox-window"
import React  from "react" 
import ReactDOM from "react-dom"
import Config from "./data/Config" 
import RunGame from "./components/RunGame" 

ReactDOM.render(
    <RunGame />,
    document.getElementById("root")
)

if (Config.REGISTER_SERVICEWORKER) {
    let worker = new Workbox("/serviceworker.js")

    worker.addEventListener("installed", e => {
        console.info(`Service worker ${e.isUpdate ? "updated" : "installed"}`)
    })
    worker.register()
}