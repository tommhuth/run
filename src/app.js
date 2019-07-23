import "../assets/style/app.scss"

import React from "react"
import { Provider } from "react-redux"
import ReactDOM from "react-dom"
import makeStore from "./store/make-store"
import { Canvas } from "react-three-fiber"
import { CannonProvider } from "./utils/cannon"
import Config from "./Config"
import RunnerEngine from "./components/RunnerEngine"
import Lights from "./components/Lights"
import Camera from "./components/Camera"

const store = makeStore()

ReactDOM.render(
    <>
        <h1 className="visually-hidden">Run</h1>
        <p className="visually-hidden">Infinite runner game made with React + Three.</p>

        <div style={{ height: "100vh", width: "100vw" }}>
            <Canvas pixelRatio={Math.min(1.5, window.devicePixelRatio)}>
                <Provider store={store}>
                    <CannonProvider defaultRestitution={.0}>
                        <Camera />
                        <Lights />
                        <RunnerEngine />
                    </CannonProvider>
                </Provider>
            </Canvas>
        </div>
    </>,
    document.getElementById("root")
)
