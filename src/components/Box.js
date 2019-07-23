
import React, { useState, useEffect, useRef } from "react"
import { Box as CannonBox, Vec3 } from "cannon"
import { DoubleSide } from "three"
import { useCannon } from "../utils/cannon"
import Config from "../Config"

export default function Box({ position, color, mass = 0, size = [1, 1, 1] }) {
    const [body, setBody] = useState(null)

    const ref = useCannon(
        { mass },
        body => {
            body.addShape(new CannonBox(new Vec3(size[0] / 2, size[1] / 2, size[2] / 2)))
            body.position.set(...position)

            setBody(body)
        }
    )

    useEffect(() => {
        if (body) {
            body.position.set(...position)
        }
    }, [body, position])

    return (
        <mesh ref={ref}>
            <boxBufferGeometry attach="geometry" args={size} />
            <meshPhongMaterial dithering color={color} attach="material" />
        </mesh>
    )
}
