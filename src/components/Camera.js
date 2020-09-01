
import { useEffect, useRef } from "react"
import { useThree, useFrame } from "react-three-fiber"
import { api, useStore } from "../data/store"
import GameState from "../data/const/GameState"
import animate from "../data/animate"
import random from "@huth/random"

export default function Camera() {
    let { camera } = useThree()
    let state = useStore(state => state.data.state)
    let trauma = useRef(0)
    let rotation = useRef({ x: 0, z: 0 })

    useFrame(() => {
        let maxShake = Math.PI / 32
        let shake = trauma.current * trauma.current

        camera.rotation.x = rotation.current.x + (maxShake * shake * random.float(-1, 1))
        camera.rotation.z = rotation.current.z + (maxShake * shake * random.float(-1, 1))

        if (trauma.current > 0) {
            trauma.current -= .02
        } else {
            trauma.current = 0
        }
    })

    useEffect(() => {
        return api.subscribe((incomingTrauma) => {
            trauma.current = Math.min(incomingTrauma[incomingTrauma.length - 1] + trauma.current, 1)
        }, state => state.data.trauma)
    }, [])

    useEffect(() => {
        return api.subscribe((position) => {
            camera.position.z = position.z - 5
            camera.position.y += (position.y + 6 - camera.position.y) * .05
            camera.position.x += (position.x + 5 - camera.position.x) * .05
        }, state => state.data.position)
    }, [])

    useEffect(() => {
        return animate({
            from: { z: 20 },
            to: { z: 35 },
            easing: "easeInOutSine",
            duration: 2000,
            render({ z }) {
                camera.position.z = z
            }
        })
    }, [])

    useEffect(() => {
        if ([GameState.RUNNING].includes(state)) {
            camera.position.set(5, 6, 25)
        }
    }, [state])

    useEffect(() => {
        camera.lookAt(0, 3, 20)
        rotation.current = { x: camera.rotation.x, z: camera.rotation.z }
    }, [])

    return null
}