import React, { useEffect, useRef } from "react"
import { api, useStore } from "../data/store"
import Config from "../data/Config"
import Only from "./Only"

import animate from "../data/animate"

export default function Lights() {
    let detailLight = useRef()
    let wideLight = useRef()
    let first = useRef(true)

    useEffect(() => {  
        first.current = false 

        return api.subscribe((position) => {
            if (!detailLight.current) {
                return
            }

            detailLight.current.position.z = position.z
            detailLight.current.position.y = position.y + 4
            detailLight.current.position.x = position.x

            wideLight.current.position.z = position.z
            wideLight.current.position.y += (position.y + 8 - wideLight.current.position.y) * .1
            wideLight.current.position.x = position.x
        }, state => state.data.position)
    }, []) 

    useEffect(() => {
        animate({
            from: { z: -15, y: 25, y2: 35 },
            to: { z: 40, y: 5, y2: 5 },
            easing: "easeInOutSine",
            duration: 4500,
            render({ z, y, y2 }) {
                detailLight.current.position.z = z
                detailLight.current.position.y = y2
                wideLight.current.position.z = z
                wideLight.current.position.y = y + 4
            }
        })
    }, [])

    useEffect(() => {
        return api.subscribe((time) => {
            if (!detailLight.current) {
                return
            }

            let targetDistance = time / (20 * 1000) * 10 + 11

            wideLight.current.distance += (targetDistance - wideLight.current.distance) * .1
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
                ref={detailLight}
                color={0xfbff00}
                decay={1}
                intensity={1}
                distance={8}
                position={first.current ? [0, -116, 30] : undefined}
            />
            <pointLight
                ref={wideLight}
                color={0x00ffff} 
                decay={1.1}
                intensity={1.15}
                distance={21}
                position={first.current ?  [0, -110, 30]: undefined}
            />
        </>
    )
}