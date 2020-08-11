import React, { useEffect, useState, useRef } from "react"
import { api } from "../data/store"
import { Sphere } from "cannon"
import { useCannon } from "../data/cannon"
import random from "../data/random"
import { material, geometry } from "../data/resources"

function Enemy({ x, y, z, velocityX, triggerZ, radius }) {
    let [active, setActive] = useState(false)
    let [velocityZ] = useState(random.real(-1, 1))
    let position = [x, y + radius, z]
    let first = useRef(true)
    let { ref } = useCannon({
        shape: new Sphere(radius),
        active,
        collisionFilterGroup: 4,
        customData: { enemy: true },
        collisionFilterMask: 1 | 2 | 4,
        mass: (4 / 3) * Math.PI * (radius * radius * radius),
        velocity: [velocityX, 0, velocityZ],
        position
    })

    useEffect(() => {
        first.current = false
    }, [])

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
            position={first.current ? position : undefined}
            geometry={geometry.sphere}
            ref={ref}
            material={material.blue}
            dispose={null}
        />
    )
}

export default React.memo(Enemy)