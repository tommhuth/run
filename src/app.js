import "../assets/styles/app.scss"

import React, { useEffect, useState } from "react"
import ReactDOM from "react-dom"
import { Vector3 } from "three"
import { Canvas } from "react-three-fiber"
import { CannonProvider } from "./data/cannon"
import Config from "./Config"
import Path from "./components/Path"
import Only from "./components/Only"
import Player from "./components/actors/Player"
import Post from "./components/Post"
import Camera from "./components/Camera"
import GameState from "./data/const/GameState"
import { useStore } from "./data/store"
import ErrorBoundary from "./components/ErrorBoundary"
import Lights from "./components/Lights"

function Game() {
    let state = useStore(state => state.state)
    let gameOverReason = useStore(state => state.gameOverReason)
    let attempts = useStore(state => state.attempts)
    let mustRequestOrientationAccess = useStore(state => state.mustRequestOrientationAccess)
    let hasDeviceOrientation = useStore(state => state.hasDeviceOrientation)
    let requestDeviceOrientation = useStore(state => state.requestDeviceOrientation)
    let start = useStore(state => state.start)
    let reset = useStore(state => state.reset)
    let deviceOrientationGranted = useStore(state => state.deviceOrientationGranted)
    let buildTime = new Date(Config.BUILD_TIME)

    useEffect(() => {
        let listener = () => {
            switch (state) {
                case GameState.REQUEST_ORIENTATION_ACCESS:
                    return requestDeviceOrientation()
                case GameState.READY:
                    return start()
                case GameState.GAME_OVER:
                    return reset()
            }
        }

        window.addEventListener("click", listener)

        return () => window.removeEventListener("click", listener)
    }, [state])

    useEffect(() => {
        if (mustRequestOrientationAccess && !hasDeviceOrientation) {
            let listener = () => {
                deviceOrientationGranted()
                window.removeEventListener("deviceorientation", listener)
            }

            window.addEventListener("deviceorientation", listener)

            return () => window.removeEventListener("deviceorientation", listener)
        }
    }, [state, mustRequestOrientationAccess, hasDeviceOrientation])

    let [size, sets] = useState({})

    useEffect(() => {
        setTimeout(() => { 
            sets({
                fh: window.innerHeight,
                w: document.querySelector("canvas").getBoundingClientRect().width ,
                h: document.querySelector("canvas").getBoundingClientRect().height
            })
        }, 2000)
    }, [])

    return (
        <>
            <div className="ui">
                {state} {gameOverReason ? <>({gameOverReason})</> : null}<br />
                Built @ {buildTime.getDate().toString().padStart(2, "0")}.{buildTime.getMonth().toString().padStart(2, "0")} {buildTime.getHours().toString().padStart(2, "0")}:{buildTime.getMinutes().toString().padStart(2, "0")} <br />
                <button onClick={()=> location.reload(true)}>Reload</button>
            </div>
            <Canvas
                colorManagement
                style={{
                    overflow: "visible"
                }}
                orthographic
                noEvents
                pixelRatio={Math.min(window.devicePixelRatio, Config.IS_LARGE_SCREEN ? 1 : 2)}
                camera={{
                    position: new Vector3(5, 6, Config.Z_START - 10),
                    zoom: Config.IS_SMALL_SCREEN ? 25 : 30,
                    near: -75,
                    far: 100
                }}
                gl={{
                    depth: false,
                    stencil: false,
                    antialias: false
                }}
            > 
                <ErrorBoundary>
                    <Post />
                    <Lights />
                    <Camera />

                    <CannonProvider>
                        <Path />
                        <Only if={[GameState.RUNNING, GameState.GAME_OVER].includes(state)}>
                            <Player key={attempts} />
                        </Only>
                    </CannonProvider>
                </ErrorBoundary>
            </Canvas>
        </>
    )
}


ReactDOM.render(
    <Game />,
    document.getElementById("root")
) 