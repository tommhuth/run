import React, { useState } from "react"
import { Box, Vec3 } from "cannon"
import { useCannon } from "../../data/cannon"
import random from "../../data/random"
import Enemy from "../Enemy"
import { material } from "../../data/resources"

export default function EnemiesBlock({
    depth,
    start,
    active,
    y
}) {
    let { ref } = useCannon({
        shape: new Box(new Vec3(100, 5, depth / 2)),
        active,
        collisionFilterGroup: 6,
        collisionFilterMask: 1 | 2 | 4,
        position: [0, y - 5, start + depth / 2]
    })
    let [enemies] = useState(() => {
        let result = []
        let count = Math.min(Math.max(1, random.integer(1, depth * .15)), 4)

        for (let i = 0; i < count; i++) {
            let border = 50
            let radius = random.integer(2, 6)
            let x = random.pick([border, -border])
            let velocityX = random.integer(10, 16) * -x / border
            let z = start + random.integer(2, depth - 2)

            result.push({
                x,
                y: y + radius,
                radius,
                z,
                velocityX,
                triggerZ: z - random.integer(15, 22)
            })
        }

        return result
    }) 

    return (
        <>
            <mesh material={active ? material.blue : material.red} ref={ref}>
                <boxBufferGeometry attach="geometry" args={[200, 10, depth]} />
            </mesh>

            {enemies.map((props, index) => <Enemy active={active} key={index} {...props} />)}
        </>
    )
}