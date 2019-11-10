import React, { useState } from "react"
import SimulatedCylinder from "../SimulatedCylinder" 
import random from "../../data/random"
import materials from "../../data/materials"
import Cylinder from "../Cylinder"

export default function PillarsBlock({
    start,
    radius = 3.5,
    depth
}) {
    let [pillars] = useState(() => {
        let pillars = []
        let pathWidth = 2
        let extraWidth = 3
        let widthCount = pathWidth + extraWidth * 2
        let depthCount = Math.floor(depth / (radius * 2))
        let diff = depth - depthCount * radius * 2
        let pathEdge = []
        let simulationEdge = []

        for (let i = 0; i < extraWidth; i++) {
            pathEdge.push(i, widthCount - (i + 1))
        }

        for (let i = 0; i < extraWidth - 1; i++) {
            simulationEdge.push(i, widthCount - (i+1))
        } 

        for (let i = 0; i < widthCount; i++) {
            for (let j = 0; j < depthCount; j++) {
                let height = pathEdge.includes(i) ? random.pick([58, 59, 57, 60]) : random.pick([39, 40, 41])
                let simulated = !simulationEdge.includes(i)

                pillars.push({
                    x: i * radius * 2 - (widthCount * radius * 2 / 2) + radius,
                    y: -20,
                    simulated,
                    z: j * radius * 2 + radius,
                    height,
                    radius
                })
            }
        }

        if (diff > 0) {
            pillars.push({
                x: 0,
                simulated:true,
                y: -20,
                z: depthCount * radius * 2 + diff / 2,
                height: 40,
                radius: Math.max(diff / 2, 3)
            })
        }

        return pillars
    })

    return (
        <>
            {pillars.map((i, index) => {
                if (!i.simulated) {
                    return (
                        <Cylinder
                            key={index}
                            height={i.height}
                            material={materials.gray}
                            radius={i.radius}
                            position={[i.x, i.y, i.z + start]}
                        />
                    )
                }

                return (
                    <SimulatedCylinder
                        key={index}
                        height={i.height}
                        radius={i.radius}
                        position={[i.x, i.y, i.z + start]}
                    />
                )
            })}
        </>
    )
}