import "../assets/styles/app.scss"

import { Workbox } from "workbox-window"
import React  from "react" 
import ReactDOM from "react-dom"
import Config from "./data/Config" 
import RunGame from "./components/RunGame" 
import FontLoader from "./components/FontLoader" 

ReactDOM.render(
    <FontLoader>
        <h1 className="visually-hidden">Run</h1>
        <p className="visually-hidden">Infinite runner made with Threejs. <a href="https://github.com/tommhuth/run">GitHub</a></p>
        
        <RunGame />
    </FontLoader>,
    document.getElementById("root")
)

if (Config.REGISTER_SERVICEWORKER) {
    let worker = new Workbox("/serviceworker.js")

    worker.addEventListener("installed", e => {
        console.info(`Service worker ${e.isUpdate ? "updated" : "installed"}`)
    })
    worker.register()
}