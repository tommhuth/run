import React, { useState } from "react"
import SimulatedCylinder from "../SimulatedCylinder"
import random from "../../data/random"

export default function StepsBlock({
    start,
    depth
}) {
    let [baseOffsetX] = useState(random.integer(-1, 1))
    let [baseOffsetY] = useState(random.integer(0, 1))
    let [flip] = useState(random.bool())
    let [steps] = useState(() => {
        let total = 0
        let max = false
        let steps = []

        while (!max) {
            let gap = random.real(-3, 2)
            let radius = random.real(1.5, 3.5)

            if (total + gap + radius * 2 > depth) {
                max = true
            } else {
                steps.push({
                    z: total + gap + radius / 2,
                    y: baseOffsetY + steps.length - 1 + random.real(-.25, .25),
                    x: Math[flip ? "cos" : "sin"](steps.length - 1) * 2 + baseOffsetX,
                    radius,
                    gap,
                })

                // this is not accurate
                total += gap + radius * 2
            }
        }

        if (depth - total > 2) {
            let radius = (depth - total) / 2

            steps.push({
                z: total + radius,
                y: baseOffsetY + steps.length / 2,
                x: 0,
                radius: (depth - total) / 2,
                gap: 0,
            }) 
        }

        return steps
    })

    return (
        <>
            {steps.map((i, index) => {
                return (
                    <SimulatedCylinder
                        key={index}
                        radius={i.radius}
                        height={20}
                        mass={0}
                        segments={8}
                        position={[i.x, -10 + i.y, start + i.z + i.radius / 2]}
                    />
                )
            })}
        </>
    )
}