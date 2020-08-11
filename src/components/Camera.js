
import React, { useEffect, useRef } from "react"
import { api, useStore } from "../data/store"
import Config from "../Config"
import { useFrame, useThree } from "react-three-fiber"
import GameState from "../data/const/GameState"

export default function Camera() {
    let { camera } = useThree()
    let light = useRef()
    let light2 = useRef()
    let state = useStore(i => i.state)
    let targetPosition = useRef([0, 0, Config.Z_START - 5])

    useEffect(() => { 
        if (state === GameState.RUNNING) {
            camera.position.set(5, 5, Config.Z_START - 10)
            camera.lookAt(0, 0, 0)

            return api.subscribe(
                ({ x, y, z }) => targetPosition.current = [x, y + 5, z],
                state => state.position
            )
        }
    }, [state])

    useFrame(() => { 
        if (state === GameState.RUNNING) {
            camera.position.z += (targetPosition.current[2] - camera.position.z) * .1
            camera.position.y += (targetPosition.current[1] - camera.position.y) * .025
            camera.position.x += (targetPosition.current[0] - camera.position.x) * .01

            
            light.current.position.x = targetPosition.current[0]
            light.current.position.y = targetPosition.current[1] - 5 + 1
            light.current.position.z = targetPosition.current[2]
/**/
            /*
            light2.current.position.x = targetPosition.current[0]
            light2.current.position.y = targetPosition.current[1] - 4
            light2.current.position.z = targetPosition.current[2]
            */
        }
    })

    return (
        <>
            <pointLight
                decay={2}
                ref={light}
                distance={28}
                intensity={42.7}
                color={0xff0000}
            />
        </>
    )
}
1
