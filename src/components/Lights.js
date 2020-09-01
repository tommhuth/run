import React, { useEffect, useRef, useLayoutEffect } from "react"
import { api, useStore } from "../data/store"
import Config from "../data/Config"
import Only from "./Only"

import animate from "../data/animate"
import { useFrame } from "react-three-fiber"
import GameState from "../data/const/GameState"

export default function Lights() {
    let light = useRef()
    let state = useStore(store => store.data.state)
    let position = useRef({ x: 0, y: 10, z: 40 }) //  0, 2, 40
    let extraDistance = Config.IS_SMALL_SCREEN ? 1.65 : 1
    let targetDistance = useRef(21 * extraDistance)

    useLayoutEffect(() => {
        light.current.position.set(0, -100, -30)
    }, [])

    useFrame(() => { 
        if (!light.current || state !== GameState.RUNNING) {
            return
        }

        light.current.distance += (targetDistance.current - light.current.distance) * .025

        light.current.position.z = position.current.z
        light.current.position.y += (position.current.y + 8 - light.current.position.y) * .1
        light.current.position.x = position.current.x
    })

    useEffect(() => {
        return api.subscribe(({ x, y, z }) => {
            position.current = { x, y, z }

        }, state => state.data.position)
    }, [])

    useEffect(() => {
        return animate({
            from: { z: -30, y: 25 },
            to: { z: 40, y: 5 },
            easing: "easeInOutSine",
            duration: 1800,
            render({ z, y }) {
                light.current.position.z = z
                light.current.position.y = y + 4
            }
        })
    }, [])

    useEffect(() => {
        return api.subscribe((time) => {
            let minDistance = 12

            targetDistance.current = Math.min(time / 1000 / 20 * 13 + minDistance, 24)
        }, state => state.data.time)
    }, [])

    return (
        <> 
            <ambientLight color={0xffffff} intensity={.2} />
            <pointLight
                ref={light}
                color={0xffffff}
                decay={1.5}
                intensity={2}
                distance={21 * extraDistance}
            />
        </>
    )
}