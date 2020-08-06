import "../assets/styles/app.scss"

import React, { useEffect, useRef, useState } from "react"
import ReactDOM from "react-dom"
import { Vector3 } from "three"
import { Canvas, useFrame, useThree } from 'react-three-fiber'
import { CannonProvider, useCannon } from './data/cannon'
import Config from "./Config"
import Path from "./components/Path"
import Player from "./components/Player"
import Post from "./components/Post"
import Camera from "./components/Camera"
import GameState from "./data/const/GameState"
import { useStore } from "./data/store"

class ErrorBoundary extends React.Component {
    state = { hasError: false }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.log(error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return null
        }

        return this.props.children
    }
}

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
        let listener = () => {
            if (document.hidden && state === GameState.RUNNING) {
                // actions.stopTimer()
            } else if (!document.hidden && state === GameState.RUNNING) {
                //  actions.startTimer()
            }
        }

        document.addEventListener("visibilitychange", listener)

        return () => document.removeEventListener("visibilitychange", listener)
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
                orthographic
                noEvents
                pixelRatio={Math.min(window.devicePixelRatio, window.matchMedia("(min-width: 1300px)").matches ? 1.5 : 2)}
                camera={{
                    position: new Vector3(5, 6, Config.Z_START - 10),
                    zoom: 30,
                    near: -100,
                    far: 85
                }}
                gl={{
                    depth: false,
                    stencil: false,
                    antialias: false
                }}
            >
                <fog attach="fog" near={110} far={1100} color={0x044747} />
                <ErrorBoundary>
                    <directionalLight
                        color={0xffffff}
                        position={[-1, 5, -3]}
                        intensity={.4}
                        onUpdate={self => self.updateMatrixWorld()}
                    />
                    <ambientLight intensity={.1} color={0xffffff} />
                    <fog attach="fog" near={0} far={80} color={0x16045e}/>

                    <Post />

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