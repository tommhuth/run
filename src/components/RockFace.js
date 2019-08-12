import React, { useState, useEffect } from "react"
import Model from "./Model"
import random from "../utils/random"
import Only from "./Only"

let rotationsLarge = Array.from({ length: 10 }).map((u, i) => .1 / 10 * i - .1)

export default function RockFace({
    position,
    size,
    scaling = 4,
    baseCount = 3
}) {
    let [rocks, setRocks] = useState([])
    let [count] = useState(random.integer(baseCount - 1, baseCount))
    let [gravelType] = useState(random.pick(["gravel", "gravel2"]))
    let [doGravel] = useState(random.bool(.75))

    useEffect(() => {
        let rocks = []

        for (let i = 0; i < count; i++) {
            rocks.push({
                type: random.pick(["box", "box2"]),
                position: [
                    position[0] + (i === 0 ? 0 : random.integer(-2, 2)),
                    position[1] + (i === 0 ? 0 : random.integer(-3, -1)),
                    position[2]
                ],
                size: [
                    size[0] + (i === 0 ? 0 : random.integer(-scaling * 2, scaling * 2)),
                    size[1] + (i === 0 ? 0 : random.integer(-scaling * .3, scaling * .3)),
                    size[2] + (i === 0 ? 0 : random.integer(-scaling, scaling))
                ],
                rotation: [
                    random.pick(rotationsLarge),
                    random.pick(rotationsLarge),
                    random.pick(rotationsLarge)
                ]
            })
        }

        setRocks(rocks)
    }, [])

    return (
        <>
            {rocks.map((i, index) => (
                <React.Fragment key={index} >
                    <Only if={index === 0 && doGravel} >
                        <Model
                            position={[
                                position[0] - i.rotation[0] * 15,
                                position[1] + i.size[1] / 2,  
                                position[2],  
                            ]}
                            flippable={false}
                            scale={[
                                Math.min(i.size[0], i.size[2]),
                                Math.min(i.size[0], i.size[2]),
                                Math.min(i.size[0], i.size[2])
                            ]}
                            rotation={i.rotation}
                            mass={null}
                            type={gravelType}
                        />
                    </Only>
                    <Model
                        type={i.type}
                        position={i.position}
                        rotation={i.rotation}
                        scale={i.size}
                    />
                </React.Fragment>
            ))}
        </>
    )
}
