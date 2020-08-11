import "../assets/styles/app.scss"

import React, { useEffect  } from "react"
import ReactDOM from "react-dom"
import { Vector3 } from "three"
import { Canvas  } from "react-three-fiber"
import { CannonProvider } from "./data/cannon"
import Config from "./Config"
import Path from "./components/Path"
import Player from "./components/actors/Player"
import Post from "./components/Post"
import Camera from "./components/Camera"
import GameState from "./data/const/GameState"
import { useStore } from "./data/store"  
import ErrorBoundary from "./components/ErrorBoundary"
import Lights from "./components/Lights"

function Game() {
    let state = useStore(state => state.state)
    let attempts = useStore(state => state.attempts)
    let mustRequestOrientationAccess = useStore(state => state.mustRequestOrientationAccess)
    let hasDeviceOrientation = useStore(state => state.hasDeviceOrientation)
    let requestDeviceOrientation = useStore(state => state.requestDeviceOrientation)
    let start = useStore(state => state.start)
    let reset = useStore(state => state.reset)
    let deviceOrientationGranted = useStore(state => state.deviceOrientationGranted)

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

    return (
        <>
            <div className="ui">
                {state}
            </div>
            <Canvas
                colorManagement
                orthographic
                noEvents
                shadowMap={true}
                pixelRatio={Math.min(window.devicePixelRatio, window.matchMedia("(min-width: 1300px)").matches ? 1.5 : 2)}
                camera={{
                    position: new Vector3(5, 6, Config.Z_START - 10),
                    zoom: 30,
                    near: -75,
                    far: 100
                }}
                gl={{
                    depth: false,
                    stencil: false,
                    antialias: false
                }}
            >
                <color attach="background" args={[0xD30C7B]} />  

                <ErrorBoundary> 
                    <Post />
                    <Lights />

                    <CannonProvider>
                        <Path />
                        <Player key={attempts} />
                    </CannonProvider>
                    <Camera />
                </ErrorBoundary>
            </Canvas>
        </>
    )
}


ReactDOM.render(
    <Game />,
    document.getElementById("root")
) 