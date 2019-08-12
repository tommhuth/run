import React, { useState, useEffect } from "react"
import { Box as CannonBox, Vec3 } from "cannon" 
import { useCannon } from "../utils/cannon" 

export default function Box({
    position,
    size = [1, 1, 1],
    color = 0xDDDDDD,
    mass = 0,
    rotation: [rotateX, rotateY, rotateZ] = [0, 0, 0]
}) {
    const [body, setBody] = useState(null) 
    const ref = useCannon(
        { mass },
        body => {
            body.addShape(new CannonBox(new Vec3(size[0] / 2, size[1] / 2, size[2] / 2)))
            body.position.set(...position)

            body.quaternion.setFromEuler(rotateX, rotateY, rotateZ)

            setBody(body)
        }
    )

    useEffect(() => {
        if (body && mass === 0) {
            body.position.set(...position)
        }
    }, [body, position, mass])

    return (
        <mesh ref={ref} castShadow receiveShadow>
            <boxBufferGeometry attach="geometry" args={size} />
            <meshPhongMaterial dithering color={color} attach="material" />
        </mesh>
    )
}
