
import React, { useEffect, useRef, useState } from "react"
import { api, useStore } from "../data/store"
import Config from "../Config"
import { useFrame, useThree } from "react-three-fiber"
import GameState from "../data/const/GameState"
import Only from "./Only"
import shallow from "zustand/shallow"
import animate from "../data/animate"

export default function Camera() {
    let { camera } = useThree()
    let light = useRef()
    let light2 = useRef()
    let [ready, setReady] = useState(false)
    let state = useStore(i => i.state)
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
        camera.position.set(5, Config.Y_INIT, Config.Z_START)
        camera.lookAt(0, Config.Y_INIT - 5, Config.Z_START + 10)

        return animate({
            from: { y: Config.Y_INIT },
            to: { y:  Config.Y_START },
            duration: 2600,
            complete() {
                setReady(true)
            },
            render({ y }) {
                camera.position.y = y
            }
        })
    }, [])

    useEffect(() => {
        /*
        if (!Config.DO_FULL_POST_PROCESSING) {
            light2.current.position.z = 0
            light2.current.position.y = -30
            light2.current.position.x = 50
        }
        */
    }, [])

    useFrame(() => {
        if (state === GameState.RUNNING && ready) {
            camera.position.z += (targetPosition.current[2] - camera.position.z) * .1
            camera.position.y += (targetPosition.current[1] - camera.position.y) * .01
            camera.position.x += (targetPosition.current[0] - camera.position.x) * .1
        }

        /*
        if (!Config.DO_FULL_POST_PROCESSING && state === GameState.RUNNING) {
            light2.current.position.z += (targetPosition.current[2] + 10 - light2.current.position.z) * .05
            light2.current.position.y = targetPosition.current[1] - 30
            light2.current.position.x = 50
        }
        */

        light.current.position.x = targetPosition.current[0]
        light.current.position.y = blockY.current + 1
        light.current.position.z = targetPosition.current[2] - 3
    })

    return (
        <>
            <pointLight
                decay={2}
                ref={light}
                distance={28}
                intensity={20}
                color={0xff0000}
            />
            <Only if={!Config.DO_FULL_POST_PROCESSING}>
                
            </Only>
        </>
    )
}

/*
<pointLight
                    decay={2}
                    ref={light2}
                    distance={90}
                    intensity={0}
                    color={0xffff00}
                />

                */
