// polyfill
import "../assets/styles/app.scss"

import "core-js/stable"

import { Workbox } from "workbox-window"
import React from "react"
import { CannonProvider } from "./data/cannon"
import { Canvas } from "react-three-fiber"
import ReactDOM from "react-dom"
import Config from "./data/Config"
import Lights from "./components/Lights"
import Camera from "./components/Camera"
import Path from "./components/Path"
import Player from "./components/Player"
import Ui from "./Ui"
import { useStore } from "./data/store"
import GameState from "./data/const/GameState"

function App() {
    let state = useStore(state => state.data.state)

    return (
        <>
            <Ui />
            <Canvas pixelRatio={2}>
                <CannonProvider defaultFriction={.8} defaultRestitution={.5}>
                    <Camera />
                    <Lights />
                    {[GameState.RUNNING, GameState.GAME_OVER].includes(state) ? <Player /> : null}
                    <Path />
                </CannonProvider>
            </Canvas>
        </>
    )
}

ReactDOM.render(
    <App />,
    document.getElementById("root")
)

if (Config.REGISTER_SERVICEWORKER) {
    let worker = new Workbox("/serviceworker.js")

    worker.addEventListener("installed", e => {
        console.info(`Service worker ${e.isUpdate ? "updated" : "installed"}`)
    })
    worker.register()
}