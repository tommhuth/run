import "../assets/styles/app.scss"

import { useEffect } from "react"
import { Vector3 } from "three"
import { Canvas } from "react-three-fiber"
import { CannonProvider } from "./data/cannon"
import Config from "./Config"
import Path from "./components/Path"
import Only from "./components/Only"
import Player from "./components/actors/Player" 
import Camera from "./components/Camera"
import GameState from "./data/const/GameState"
import { useStore } from "./data/store"
import ErrorBoundary from "./components/ErrorBoundary"
import Lights from "./components/Lights"
import TitleCard from "./ui/TitleCard"
import GameOverStats from "./ui/GameOverStats"
import Message from "./ui/Message"
import RunnerStats from "./ui/RunnerStats"  

export default function Game() {
    let state = useStore(state => state.state)
    let attempts = useStore(state => state.attempts)
    let gameOverReason = useStore(state => state.gameOverReason)
    let mustRequestOrientationAccess = useStore(state => state.mustRequestOrientationAccess)
    let hasDeviceOrientation = useStore(state => state.hasDeviceOrientation)
    let requestDeviceOrientation = useStore(state => state.requestDeviceOrientation)
    let start = useStore(state => state.start)
    let canBegin = useStore(state => state.canBegin)
    let canStart = useStore(state => state.canStart)
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
        if ([GameState.GAME_OVER, GameState.READY].includes(state)) { 
            setTimeout(() => canBegin(), 1000)
        }
    }, [state, attempts])

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
            <Only if={[GameState.REQUEST_ORIENTATION_ACCESS, GameState.READY, GameState.INTRO].includes(state)}>
                <TitleCard lines={Config.IS_SMALL_SCREEN ? ["Roll", "Brit" ] : ["Roll", "Britney"]} big />
                <Only if={canStart}>
                    <Message text="Tap to start" /> 
                </Only>
            </Only>

            <Only if={state === GameState.GAME_OVER}>
                <GameOverStats />

                <TitleCard lines={["You", gameOverReason]} />

                <Only if={canStart}> 
                    <Message text="Tap to restart" />
                </Only> 
            </Only>

            <Only if={state === GameState.RUNNING}>
                <RunnerStats />
            </Only>

            <Canvas
                colorManagement
                style={{
                    overflow: "visible"
                }}
                className="main"
                orthographic
                noEvents
                shadowMap 
                pixelRatio={Math.min(1.5, window.devicePixelRatio)}
                camera={{
                    position: new Vector3(...Config.CAMERA_PRESTART),
                    zoom: Config.IS_SMALL_SCREEN ? 10 : 20,
                    near: -75,
                    far: 100
                }}
                gl={{
                    depth: true,
                    stencil: false,
                    alpha: true,
                    antialias: true
                }}
            >
                <fog attach="fog" />
                <ErrorBoundary >
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