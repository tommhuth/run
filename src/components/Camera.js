
import React, { useEffect, useRef, useState } from "react"
import { api, useStore } from "../data/store"
import Config from "../Config"
import { useFrame, useThree } from "react-three-fiber"
import GameState from "../data/const/GameState" 
import shallow from "zustand/shallow" 
import animate from "@huth/animate"


export default function Camera() {
    let { camera } = useThree()
    let light = useRef()
    let [ready, setReady] = useState(false)
    let state = useStore(i => i.state)
    let attempts = useStore(i => i.attempts)
    let targetPosition = useRef([0, 0, 0])
    let blockY = useRef()

    useEffect(() => {
        return api.subscribe(
            ([{ x, z, y }, currentBlockY = 0]) => {
                targetPosition.current = [x, currentBlockY + 5, z + 3]
                blockY.current = y
            },
            state => ([
                state.position,
                state.blocks.find(i => i.start < state.position.z && i.end > state.position.z)?.y
            ]),
            shallow
        )
    }, [])

    useEffect(() => {
        camera.position.set(...Config.CAMERA_PRESTART)
        camera.lookAt(Config.CAMERA_PRESTART[0] - 5, Config.CAMERA_PRESTART[1] - 5, Config.CAMERA_PRESTART[2] + 10)

        return animate({
            from: Config.CAMERA_PRESTART[1],
            to: Config.CAMERA_START[1],
            duration: 2600,
            delay: 750,
            easing: "easeOutQuart",
            end() {
                setReady(true)
            },
            render(y) {
                camera.position.y = y
            }
        })
    }, [])

    useEffect(() => {
        if (state === GameState.RUNNING && attempts > 0) {
            camera.position.set(...Config.CAMERA_START)
        }
    }, [state, attempts])

    useFrame(() => {
        if (state === GameState.RUNNING && ready) {
            camera.position.z += (targetPosition.current[2] - camera.position.z) * .1
            camera.position.y += (targetPosition.current[1] - camera.position.y) * .01
            camera.position.x += (targetPosition.current[0] - camera.position.x) * .1
        }

        light.current.position.x = targetPosition.current[0]
        light.current.position.y = blockY.current + 1
        light.current.position.z = targetPosition.current[2] - 3
    })

    return (
        <>
            <pointLight
                decay={2}
                ref={light}
                distance={24}
                intensity={20}
                color={0xff0000}
            />
        </>
    )
}
