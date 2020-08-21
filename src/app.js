import RunGame from "./RunGame" 
import React from "react"
import ReactDOM from "react-dom"
import FontLoader from "./ui/FontLoader"
import { Workbox } from "workbox-window"
import Config from "./Config"

ReactDOM.render(
    <FontLoader>  
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