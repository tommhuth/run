import React, { useEffect, useState } from "react"
import { useFrame } from "react-three-fiber"
import { api } from "../data/store"
import { Sphere } from "cannon"
import { useCannon } from "../data/cannon"
import random from "../data/random"
import { material, geometry } from "../data/resources"

export default function Enemy({ x, y, z, velocityX, triggerZ, radius }) {
    let [active, setActive] = useState(false)
    let [velocityZ] = useState(random.real(-1, 1))
    let { ref, body } = useCannon({
        shape: new Sphere(radius),
        active,
        collisionFilterGroup: 4,
        collisionFilterMask: 1 | 2 | 4,
        mass: radius * radius * radius,
        position: [x, y + radius, z]
    })

    useFrame(() => {
        body.velocity.x = velocityX
        body.velocity.z = velocityZ
    })

    useEffect(() => {
        let unsubscribe = api.subscribe((position) => {
            if (triggerZ < position.z) {
                if (!active) {
                    setActive(true)
                    unsubscribe()
                }
            } else {
                if (active) {
                    setActive(false)
                }
            }
        }, state => state.data.position)

        return unsubscribe
    }, [active])

    return (
        <mesh
            scale={[radius, radius, radius]}
            geometry={geometry.sphere}
            ref={ref}
            material={material.blue}
            dispose={null}
        />

    )
}
