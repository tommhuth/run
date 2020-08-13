
import React, { useEffect, useRef } from "react"
import { api, useStore } from "../data/store"
import Config from "../Config"
import { useFrame, useThree } from "react-three-fiber"
import GameState from "../data/const/GameState"
import shallow from "zustand/shallow"

export default function Camera() {
    let { camera } = useThree()
    let light = useRef()
    let state = useStore(i => i.state)
    let targetPosition = useRef([0, 0, Config.Z_START - 5])
    let playerY = useRef()

    useEffect(() => {
        camera.position.set(5, 5, Config.Z_START - 10)
        camera.lookAt(0, 0, 0)

        return api.subscribe(
            ([{ x, z, y }, blockY = 0]) => {
                targetPosition.current = [x, blockY + 5, z + 3]
                playerY.current = y
            },
            state => [
                state.position,
                state.blocks.find(i => i.start < state.position.z && i.end > state.position.z)?.y
            ],
            shallow
        )
    }, [])

    useFrame(() => {
        if (state === GameState.RUNNING) {
            camera.position.z += (targetPosition.current[2] - camera.position.z) * .1
            camera.position.y += (targetPosition.current[1] - camera.position.y) * .01
            camera.position.x += (targetPosition.current[0] - camera.position.x) * .1
        }

        light.current.position.x = targetPosition.current[0]
        light.current.position.y = playerY.current + 1
        light.current.position.z = targetPosition.current[2] - 3
    })

    return (
        <pointLight
            decay={2}
            ref={light}
            distance={28}
            intensity={20}
            color={0xff0000}
        />
    )
}