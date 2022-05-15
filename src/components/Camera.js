import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useLayoutEffect, useRef } from "react"
import GameState from "../data/const/GameState"
import { useStore } from "../data/store"
import { ndelta } from "../utils/utils"

export default function Camera({ startPosition = [10, 10, -10] }) {
    let { camera } = useThree()
    let position = useRef(startPosition)
    let targetZ = useRef(0)
    let targetY = useRef(0)
    let state = useStore(i => i.state)

    useLayoutEffect(() => {
        camera.position.set(...position.current)
        camera.lookAt(0, 0, 0)
    }, [camera])

    useEffect(() => {
        return useStore.subscribe(
            i => position.current = i,
            state => state.player.position
        )
    }, [])

    useFrame((_, delta) => {
        if ([GameState.RUNNING, GameState.READY].includes(state)) {
            targetZ.current = position.current[2] + startPosition[2]
            targetY.current = position.current[1] + startPosition[1]
        }

        camera.position.z += (targetZ.current - camera.position.z) * ndelta(delta) * 10
        camera.position.y += (targetY.current - camera.position.y) * ndelta(delta)
    })

    return null
}