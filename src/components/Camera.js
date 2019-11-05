import { useEffect, useRef } from "react"
import { useThree, useFrame } from "react-three-fiber"
import { api, useStore } from "../data/store"
import GameState from "../data/const/GameState"

export default function Camera() {
    let { camera } = useThree()
    let state = useStore(state => state.data.state)
    let baseY = useStore(state => state.data.baseY)
    let attempts = useStore(state => state.data.attempts)
    let playerPosition = useRef({ x: 0, y: 0, z: 8 })

    useEffect(() => {
        camera.position.set(0, 5, 7)
        camera.lookAt(0, 0, 15)

        return api.subscribe(
            position => playerPosition.current = position,
            state => state.data.position
        )
    }, [camera])

    useEffect(()=>{ 
        camera.position.set(0, 5, 7)
    }, [attempts])

    useFrame(() => {
        camera.position.z += (playerPosition.current.z - 1 - camera.position.z) * .0175
        camera.position.x += (playerPosition.current.x - camera.position.x) * .2
        camera.position.y += (baseY + 5 - camera.position.y) * .0051
    })

    useEffect(() => {
        if (state === GameState.PRE_RUNNING) {
            camera.position.set(0, 5, 4)
        }

    }, [camera, state])

    return null
}