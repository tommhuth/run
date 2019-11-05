import React, { useEffect } from "react"
import { CannonProvider } from "../data/cannon"
import { Canvas } from "react-three-fiber"
import Lights from "./Lights"
import Camera from "./Camera"
import Path from "./Path"
import Player from "./Player"
import Ui from "../Ui"
import { useStore } from "../data/store"
import GameState from "../data/const/GameState"

export default function RunGame() {
    let state = useStore(state => state.data.state)
    let mustRequestOrientationAccess = useStore(state => state.data.mustRequestOrientationAccess)
    let hasDeviceOrientation = useStore(state => state.data.hasDeviceOrientation)
    let actions = useStore(state => state.actions)

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
        <>
            <Ui />
            <Canvas pixelRatio={window.devicePixelRatio}>
                <fog attach="fog" args={[0xffffff, 12, 30]} />
                <CannonProvider defaultFriction={.8} defaultRestitution={.5}>
                    <Camera />
                    <Lights />
                    {[GameState.RUNNING, GameState.GAME_OVER].includes(state) ? <Player /> : null}
                    <Path />
                </CannonProvider>
            </Canvas>
        </>
    )
}