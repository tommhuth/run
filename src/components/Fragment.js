import React, { useState } from "react"
import { Vec3, Box } from "cannon"
import { useCannon } from "../data/cannon"
import { material, geometry } from "../data/resources"
import random from "@huth/random"

export default function Fragment({ x, y, z }) {
    let [radius] = useState(() => random.float(.25, .75))
    let { ref } = useCannon({
        shape: new Box(new Vec3(radius, radius, radius)),
        collisionFilterGroup: 10,
        collisionFilterMask: 1 | 2 | 4 | 8 | 10,
        active: true,
        velocity: [
            random.pick(-20 * radius, -15 * radius, 20 * radius, 15 * radius, 13, 12, 10, 7),
            random.integer(30 * radius, 40 * radius),
            random.pick(-14 * radius, -20 * radius, 14 * radius, 20 * radius)
        ],
        mass: radius * 2,
        position: [x, y - 1, z]
    })

    return (
        <mesh
            ref={ref}
            geometry={geometry.fragment}
            scale={[radius, radius, radius]}
            material={material.blue}
            dispose={null}
        />
    )
}