import React, { useState, useEffect } from "react"
import Box from "./Box"
import random from "../utils/random"

let rotations = Array.from({ length: 10 }).map((u, i) => .1 / 10 * i - .1)

export default function RockFace({
    position = [0, 0, 0],
    size = [0, 0, 0],
    scaling = 5,
    baseCount = 3
}) {
    let [rocks, setRocks] = useState([])
    let [count] = useState(random.integer(baseCount - 1, baseCount))

    useEffect(() => {
        let rocks = []

        for (let i = 0; i < count; i++) {
            rocks.push({
                position: [
                    position[0] + random.real(-5, 5),
                    position[1],
                    position[2]
                ],
                size: [
                    size[0] + random.real(-scaling * 2, scaling * 2),
                    size[1] + random.real(-scaling / 3, scaling / 3),
                    size[2] + random.real(-scaling, scaling)
                ],
                rotation: [
                    random.real(-.051, .0515),
                    random.real(-.1, .1),
                    random.pick(rotations)
                ]
            })
        }

        setRocks(rocks)
    }, [])

    return (
        <>
            {rocks.map((i, index) => (
                <Box
                    key={index}
                    position={i.position}
                    rotation={i.rotation}
                    size={i.size}
                />
            ))}
        </>
    )
}
