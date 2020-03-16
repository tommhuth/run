import React, { useEffect, useRef } from "react"
import { CannonProvider } from "../data/cannon"
import { Canvas } from "react-three-fiber"
import Lights from "./Lights"
import Camera from "./Camera"
import Timer from "./Timer"
import Only from "./Only"
import Path from "./Path"
import Player from "./Player"
import { useStore } from "../data/store"
import GameState from "../data/const/GameState"
import Config from "../data/Config"
import { Vector3 } from "three"

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
            tid.current = setTimeout(() => actions.ready(), 4500)

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
                
                <div className="title title--intro"> 
                    {"Roll,".split("").map((i, index) => <span className="title__letter" key={index}>{i}</span>)} <br />
                    {"britney".split("").map((i, index) => <span className="title__letter" key={index}>{i}</span>)}
                </div>
                <div className="message">
                    Tap to start
                </div>
            </Only>
            
            <Only if={state === GameState.GAME_OVER}>
                <div className="title"> 
                    {"Gurl,".split("").map((i, index) => <span className="title__letter" key={index}>{i}</span>)} <br />
                    {(reason || "").split("").map((i, index) => <span className="title__letter" key={index}>{i}</span>)}
                </div>
                <div className="message">
                    Tap to restart
                </div>
            </Only>

            <Only if={state === GameState.RUNNING}>
                <Timer />
            </Only>

            <Canvas
                orthographic
                noEvents
                pixelRatio={small ? Math.min(window.devicePixelRatio, 2) : 1}
                camera={{
                    position: new Vector3(5, 6, 15),
                    zoom: Config.DEBUG_MODE ? 15 : small ? 20 : 35,
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

                    {[GameState.RUNNING, GameState.GAME_OVER].includes(state) ? <Player key={attempts} /> : null}
                </CannonProvider>
            </Canvas>
        </>
    )
}