// polyfill
import "../assets/styles/app.scss"

import { Workbox } from "workbox-window"
import React  from "react" 
import ReactDOM from "react-dom"
import Config from "./data/Config" 
import { CannonProvider } from "./data/cannon"
import { Canvas  } from "react-three-fiber"
import Path from "./components/Path" 
import Lights from "./components/Lights" 
import Camera from "./components/Camera" 
import Player from "./components/Player" 

ReactDOM.render(
    <>
        <Canvas
            orthographic
            noEvents
            pixelRatio={1}
            camera={{
                zoom: 35,
                near: -50,
                far: 100,
                left: -50,
                right: 50
            }}
        >
            <CannonProvider
                defaultFriction={.8}
                defaultRestitution={.5}
            >
                <Lights />
                <Camera />
                <Path />
                <Player />
            </CannonProvider>
        </Canvas>
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