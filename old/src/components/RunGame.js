import React, { useEffect, useRef } from "react"
import { Physics } from "use-cannon"
import { Canvas } from "react-three-fiber"
import Lights from "./Lights"
import Camera from "./Camera"
import Only from "./Only"
import Path from "./Path"
import Player from "./Player"
import { useStore } from "../data/store"
import GameState from "../data/const/GameState"
import Config from "../data/Config"
import { Vector3 } from "three"
import TitleCard from "./TitleCard" 
import Message from "./Message"
import RunnerStats from "./RunnerStats"
import GameOverStats from "./GameOverStats"

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
                <fogExp2 args={[0xc1fc1e, .0125]} attach="fog" />

                <Physics 
                    defaultContactMaterial={{
                        friction: 0.8,
                        restitution: 0.2,
                        contactEquationStiffness: 1e7,
                        contactEquationRelaxation: 1,
                        frictionEquationStiffness: 1e7,
                        frictionEquationRelaxation: 2,
                    }}
                    step={1/30}
                    gravity={[0,-10, 0]}
                    iterations={5}
                    size={5000}
                >
                    <Only if={[GameState.RUNNING, GameState.GAME_OVER].includes(state)}>
                        <Player/>
                    </Only>
                    <Path /> 
                </Physics>
                <Lights />
                <Camera />
            </Canvas>
        </>
    )
}



/*



                     

                    */