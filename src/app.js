import RunGame from "./RunGame"
import Ui from "./ui/Ui"
import React from "react"
import ReactDOM from "react-dom"
import FontLoader from "./ui/FontLoader"
import { Workbox } from "workbox-window"
import Config from "./Config"

ReactDOM.render(
    <FontLoader>
        dfsafasdf
        <Ui />
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