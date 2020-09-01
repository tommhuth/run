import React, { useEffect, useRef, Suspense } from "react"
import { CannonProvider } from "../data/cannon"
import { Canvas } from "react-three-fiber"
import Lights from "./Lights"
import Camera from "./Camera"
import Only from "./Only"
import Path from "./Path"
import Player from "./Player"
import { useStore } from "../data/store"
import GameState from "../data/const/GameState"
import Config from "../data/Config"
import { Vector3, Color } from "three"
import TitleCard from "./TitleCard" 
import Message from "./Message"
import RunnerStats from "./RunnerStats"
import GameOverStats from "./GameOverStats"
import { FullPost } from "./Post"

let c = new Color("rgb(2, 121, 132)").convertSRGBToLinear()

export default function RunGame() {
    let state = useStore(state => state.data.state)
    let reason = useStore(state => state.data.reason)
    let attempts = useStore(state => state.data.attempts)
    let mustRequestOrientationAccess = useStore(state => state.data.mustRequestOrientationAccess)
    let hasDeviceOrientation = useStore(state => state.data.hasDeviceOrientation)
    let actions = useStore(state => state.actions)
    let small = window.matchMedia("(max-width: 600px)").matches
    let tid = useRef()

    useEffect(() => {
        if (state === GameState.INTRO) {
            tid.current = setTimeout(() => actions.ready(), 2000)

            return () => clearTimeout(tid.current)
        }
    }, [state])

    useEffect(() => {
        let listener = () => {
            switch (state) {
                case GameState.REQUEST_ORIENTATION_ACCESS:
                    return actions.requestDeviceOrientation()
                case GameState.READY:
                    return actions.start()
                case GameState.GAME_OVER:
                    return actions.reset()
            }
        }

        window.addEventListener("click", listener)

        return () => window.removeEventListener("click", listener)
    }, [state])

    useEffect(() => {
        let listener = () => {
            if (document.hidden && state === GameState.RUNNING) {
                actions.stopTimer()
            } else if (!document.hidden && state === GameState.RUNNING) {
                actions.startTimer()
            }
        }

        document.addEventListener("visibilitychange", listener)

        return () => document.removeEventListener("visibilitychange", listener)
    }, [state])

    useEffect(() => {
        if (mustRequestOrientationAccess && !hasDeviceOrientation) {
            let listener = () => {
                actions.hasDeviceOrientation()
                window.removeEventListener("deviceorientation", listener)
            }

            window.addEventListener("deviceorientation", listener)

            return () => window.removeEventListener("deviceorientation", listener)
        }
    }, [state, mustRequestOrientationAccess, hasDeviceOrientation])

    return (
        <>
            <Only if={[GameState.REQUEST_ORIENTATION_ACCESS, GameState.READY, GameState.INTRO].includes(state)}>
                <TitleCard lines={["Roll,", "Britney"]} big />
                <Message text="Tap to start" /> 
            </Only>

            <Only if={state === GameState.GAME_OVER}>
                <TitleCard lines={reason === "crashed" ? ["You", reason] : ["Gurl,", reason]} /> 
                <Message text="Tap to restart" /> 

                <GameOverStats />
            </Only>

            <Only if={state === GameState.RUNNING}>
                <RunnerStats />
            </Only>

            <Canvas
                orthographic
                noEvents
                colorManagement
                pixelRatio={1}
                gl={{
                    alpha: true,
                    stencil: false,
                    depth: false,
                    antialias: false
                }}
                camera={{
                    position: new Vector3(5, 6, 15),
                    zoom: Config.DEBUG_MODE ? 15 : small ? 20 : 35,
                    near: -50,
                    far: 100,
                    left: -25,
                    right: 25
                }}
            >   
                <Suspense>
                    <FullPost />
                </Suspense>

                <primitive attach="background" object={c} />

                <CannonProvider 
                    defaultFriction={.8}
                    defaultRestitution={.5}
                >
                    <Lights />
                    <Camera />
                    <Path /> 
                    
                    <Only if={[GameState.RUNNING, GameState.GAME_OVER].includes(state)}>
                        <Player key={attempts} />
                    </Only> 
                </CannonProvider>
            </Canvas>
        </>
    )
}