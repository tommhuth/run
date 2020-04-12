import React, { useEffect, useRef } from "react"
import { api, useStore } from "../data/store"
import Config from "../data/Config"
import Only from "./Only"

import animate from "../data/animate"
import { useFrame } from "react-three-fiber"
import GameState from "../data/const/GameState"

export default function Lights() {
    let wideLight = useRef()
    let first = useRef(true)
    let state = useStore(store => store.data.state)
    let position = useRef({ x: 0, y: 0, z: 0 })
    let targetDistance = useRef(21)

    useFrame(() => {
        if (!wideLight.current || state !== GameState.RUNNING) {
            return
        }

        wideLight.current.distance += (targetDistance.current - wideLight.current.distance) * .025

        wideLight.current.position.z = position.current.z
        wideLight.current.position.y += (position.current.y + 8 - wideLight.current.position.y) * .1
        wideLight.current.position.x = position.current.x
    })

    useEffect(() => {
        first.current = false

        return api.subscribe(({ x, y, z }) => {
            position.current = { x, y, z }

        }, state => state.data.position)
    }, [])

    useEffect(() => {
        return animate({
            from: { z: 20, y: 25 },
            to: { z: 40, y: 5 },
            easing: "easeInOutSine",
            duration: 2000,
            render({ z, y }) {
                wideLight.current.position.z = z
                wideLight.current.position.y = y + 4
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
            <Only if={Config.DEBUG_MODE}>
                <directionalLight
                    color={0xffffff}
                    position={[-1, 5, -3]}
                    intensity={.5}
                    onUpdate={self => self.updateMatrixWorld()}
                />
            </Only>

            <ambientLight color={0x99eeff} intensity={.3} />
            <pointLight
                ref={wideLight}
                color={0x00ffff}
                decay={1.1}
                intensity={1.15}
                distance={21}
                position={first.current ? [0, -100, 30] : undefined}
            />
        </>
    )
}