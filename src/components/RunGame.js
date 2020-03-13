import React, { useEffect } from "react"
import { CannonProvider } from "../data/cannon"
import { Canvas, useThree } from "react-three-fiber"
import Lights from "./Lights"
import Camera from "./Camera"
import Path from "./Path"
import Player from "./Player"
import { useStore } from "../data/store"
import GameState from "../data/const/GameState"
import Config from "../data/Config"

export default function RunGame() {
    let state = useStore(state => state.data.state)
    let attempts = useStore(state => state.data.attempts)
    let mustRequestOrientationAccess = useStore(state => state.data.mustRequestOrientationAccess)
    let hasDeviceOrientation = useStore(state => state.data.hasDeviceOrientation)
    let actions = useStore(state => state.actions)
    let small = window.matchMedia("(max-width: 600px)").matches

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
        <Canvas
            orthographic
            noEvents
            pixelRatio={small ? window.devicePixelRatio : 1}
            camera={{
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
                
                {[GameState.RUNNING, GameState.GAME_OVER].includes(state) ?<Player key={attempts} />:null }
            </CannonProvider>
        </Canvas>
    )
}