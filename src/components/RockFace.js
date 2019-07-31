import React, { useState, useEffect } from "react"
import Model from "./Model"
import Box from "./Box"
import random from "../utils/random"

let rotationsLarge = Array.from({ length: 10 }).map((u, i) => .1 / 10 * i - .1)
let rotationsSmall = Array.from({ length: 5 }).map((u, i) => .05 / 5 * i - .05)

export default function RockFace({
    position,
    size,
    scaling = 4,
    baseCount = 3
}) {
    let [rocks, setRocks] = useState([])
    let [count] = useState(random.integer(baseCount - 1, baseCount))

    useEffect(() => {
        let rocks = []

        for (let i = 0; i < count; i++) {
            rocks.push({
                type: random.pick(["box", "box2"]),
                position: [
                    position[0] + random.integer(-2, 2),
                    position[1] + (i === 0 ? 0 : random.integer(-3, -1) ),
                    position[2]
                ],
                size: [
                    size[0] + random.integer(-scaling * 2, scaling * 2),
                    size[1] + random.integer(-scaling * .3, scaling * .3),
                    size[2] + random.integer(-scaling, scaling)
                ],
                rotation: [
                    random.pick(rotationsSmall),
                    random.pick(rotationsSmall),
                    random.pick(rotationsLarge)
                ]
            })
        }

        setRocks(rocks)
    }, [])

    return (
        <>
            {rocks.map((i, index) => (
                <Model
                    type={i.type}
                    key={index}
                    position={i.position}
                    rotation={i.rotation}
                    scale={i.size}
                />
            ))}
        </>
    )
}
