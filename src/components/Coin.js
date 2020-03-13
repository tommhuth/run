import React, { useEffect, useState, useRef } from "react"
import { api } from "../data/store" 
import { material, geometry } from "../data/resources"
import { useFrame } from "react-three-fiber"

function useFrameNumber(speed = .1, init = 0) {
    let frame = useRef(init)

    useFrame(() => frame.current += speed)

    return frame
}

let i = 0

export default function Coin({ x, y, z, remove }) {
    let [count] = useState(() => i++)
    let frame = useFrameNumber(.05, count)
    let ref = useRef()

    useFrame(() => {
        if (ref.current) {
            ref.current.rotation.y += .025
            ref.current.position.y = Math.cos(frame.current) * .5 + y + 1 + .5
        } 
    })

    useEffect(() => {
        ref.current.position.set(x, y + 1 + .5, z)

        return api.subscribe((position) => {
            let threshold = 1.75

            if (
                position.y > y - threshold && position.y < y + threshold &&
                position.z > z - threshold && position.z < z + threshold &&
                position.x < x + threshold && position.x > x - threshold
            ) {
                remove()
            }
        }, state => state.data.position)
    }, [])

    return (
        <mesh
            ref={ref}
            scale={[.65, 1, .65]}
            geometry={geometry.coin}
            material={material.white}
            dispose={null}
        />
    )
}