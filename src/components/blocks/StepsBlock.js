import React, { useState } from "react"
import SimulatedCylinder from "../SimulatedCylinder"
import random from "../../data/random"
import ParticleCloud from "../ParticleCloud"
import Only from "../Only"

export default function StepsBlock({
    start,
    depth
}) {
    let [baseOffsetX] = useState(random.integer(-1, 1)) 
    let [cloud] = useState(random.bool(.5))
    let [flip] = useState(random.bool())
    let [steps] = useState(() => {
        let total = 0
        let max = false
        let steps = []

        while (!max) {
            let gap = random.integer(-1, 2)
            let radius = random.real(1.5, 3.5)

            if (total + gap + radius * 2 > depth) {
                max = true
            } else {
                steps.push({
                    z: total + gap + radius,
                    y: Math.abs(Math.cos((steps.length + 4)/2) * 2),
                    x: Math[flip ? "cos" : "sin"](steps.length - 1) * 2 + baseOffsetX,
                    radius,
                    gap,
                })
 
                total += gap + radius * 2
            }
        } 

        if (depth - total > 1) {
            let radius = (depth - total) / 2 

            steps.push({
                z: total + radius,
                y: 1, 
                x: 0,
                radius: (depth - total) / 2,
                gap: 0,
            })
        }

        return steps
    })

    return (
        <>
        <Only if={cloud}>
            <ParticleCloud position={[-2, 0, start + depth / 2]} />
        </Only>

            {steps.map((i, index) => { 
                return (
                    <SimulatedCylinder
                        key={index}
                        radius={i.radius}
                        height={40}
                        mass={0}
                        segments={8}
                        position={[i.x, -20 + i.y, start + i.z]}
                    />
                )
            })}
        </>
    )
}