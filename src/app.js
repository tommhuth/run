// polyfill
import "../assets/styles/app.scss"

import { Workbox } from "workbox-window"
import React  from "react" 
import ReactDOM from "react-dom"
import Config from "./data/Config" 
import RunGame from "./components/RunGame" 

document.getElementById("spinner").remove()

ReactDOM.render(
    <>
        <h1 className="visually-hidden">Run</h1>
        <p className="visually-hidden">Infinite runner made with Threejs</p>
        
        <RunGame />
    </>,
    document.getElementById("root")
)

if (Config.REGISTER_SERVICEWORKER) {
    let worker = new Workbox("/serviceworker.js")

    worker.addEventListener("installed", e => {
        console.info(`Service worker ${e.isUpdate ? "updated" : "installed"}`)
    })
    worker.register()
}