import "../assets/styles/app.scss"

import React, { useEffect, useRef, useState } from "react"
import ReactDOM from "react-dom"
import { Vector3, CameraHelper,PCFShadowMap } from "three"
import { Canvas, useFrame, useThree } from 'react-three-fiber'
import { CannonProvider, useCannon } from './data/cannon'
import Config from "./Config"
import Path from "./components/Path"
import Player from "./components/Player"
import Post from "./components/Post"
import Camera from "./components/Camera"
import GameState from "./data/const/GameState"
import { useStore, api } from "./data/store"
import Color from "./data/const/Color"
import { softShadows } from "drei"
import shallow from "zustand/shallow"


/*
softShadows({
    size:.01
})
*/

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
                    depth: true,
                    stencil: false,
                    antialias: false
                }}
            >
                <color attach="background" args={[0xD30C7B]} />
                <fog attach="fog" color={0xFF00FF} near={25} far={220} />

                <Lights />

                <ErrorBoundary>

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

function Lights() {
    let lightRef = useRef()
    let { scene } = useThree()

    useEffect(() => {
        scene.add(lightRef.current.target) 

        lightRef.current.position.y = 0
        lightRef.current.target.position.y = -8
        lightRef.current.updateMatrixWorld()

        return api.subscribe(
            ([position, lastBlock]) => { 
                if (lightRef.current && Math.round(position.z) % 3 === 0) {
                    lightRef.current.position.z = position.z
                    lightRef.current.position.y = lastBlock.y
                    lightRef.current.target.position.z = position.z - 20
                    lightRef.current.target.position.y = lastBlock.y - 8
                    lightRef.current.updateMatrixWorld()
                }
            },
            store => [store.position, store.blocks[store.blocks.length - 1]],
            shallow
        )
    }, [])

    return (
        <>
            <directionalLight
                ref={lightRef} 
                color={0xffffff}
                position={[0, 0, 0]}
                target-position={[0, 0, -20]}
                intensity={.65}
                onUpdate={self => {
                    self.updateMatrixWorld()
                }}  
            />
            <hemisphereLight groundColor={"red"} color="blue" intensity={1} />
        </>
    )
}


ReactDOM.render(
    <Game />,
    document.getElementById("root")
) 