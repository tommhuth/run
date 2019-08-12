import React, { useState, useEffect } from "react"
import Model from "./Model"
import random from "../utils/random"

export default function RockPillar({
    position,
    size,
    height
}) {
    let [rocks, setRocks] = useState([])

    useEffect(() => {
        let rocks = []
        let count = random.integer(2, 4)

        for (let i = 0; i < count; i++) {
            rocks.push({
                type: random.pick(["box", "box2"]),
                position: [
                    position[0] + (i === 0 ? 0 : random.real(-.25, -.25)),
                    position[1] + (i === 0 ? 0 : random.real(-8, -1)),
                    position[2] + (i === 0 ? 0 : random.real(-.25, -.25))
                ],
                size: [
                    size,
                    height,
                    size,
                ],
                rotation: [
                    random.real(-.05, .05),
                    random.real(-.25, .25),
                    random.real(-.05, .05)
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
