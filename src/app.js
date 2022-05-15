import "../assets/styles/app.scss"
import "requestidlecallback-polyfill"

import ReactDOM from "react-dom"
import { Canvas } from "@react-three/fiber"

import { useEffect } from "react"
import { CannonProvider } from "./utils/cannon"
import { ModelsProvider } from "./utils/models"
import Path from "./components/path/Path"
import { start, useStore } from "./data/store"
import GameState from "./data/const/GameState"
import Player from "./components/Player"
import Camera from "./components/Camera"

function RunGame() {
    let state = useStore(i => i.state)

    useEffect(() => {
        let listener = () => {  
            switch (state) {
                //case GameState.REQUEST_ORIENTATION_ACCESS:
                //return requestDeviceOrientation()
                case GameState.READY:
                    return start()
                //case GameState.GAME_OVER:
                //return reset()
            }
        }

        window.addEventListener("click", listener)

        return () => window.removeEventListener("click", listener)
    }, [state])

    return (
        <> 
            <Player />
            <Path />
        </>
    )
}

function App() { 
    return (
        <>
            <div
                style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    color: "black",
                    zIndex: 1000
                }}
                id="debug"
            />

            <Canvas
                orthographic
                dpr={.85}
                camera={{
                    zoom: 50, // 24,
                    near: 0,
                    far: 100
                }}
                linear
                colorManagement 
                gl={{
                    antialias: true,
                    depth: true,
                    stencil: false,
                    alpha: true
                }}
            > 

                <Camera />

                <directionalLight
                    color={0xaaaaff}
                    position={[6, 12, 10]}
                    intensity={.5} 
                    onUpdate={self => { 
                        self.updateMatrixWorld()
                    }}
                />
                <ambientLight intensity={.5} />

                <CannonProvider axisIndex={2}>
                    <ModelsProvider>
                        <RunGame />
                    </ModelsProvider>
                </CannonProvider>
            </Canvas>
        </>
    )
}

ReactDOM.render(<App />, document.getElementById("root"))