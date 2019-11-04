import React, { useState } from "react"
import SimulatedBox from "../SimulatedBox"
import SimulatedCylinder from "../SimulatedCylinder"
import { useRandomVector } from "../../data/hooks"
import random from "../../data/random"

export default function BaseTowerBlock({
    start,
    end,
    depth
}) {
    let [width] = useState(random.integer(5, 8)) 
    let [y] = useState(random.integer(-1, 1))
    let [x] = useState(random.integer(-1, 1))

    return (
        <>
            {/* floor */}
            <SimulatedCylinder
                height={40}
                segments={12}
                radius={Math.max(width, depth) / 2}
                position={[x, -20 + y, start + depth / 2]}
            /> 
        </>
    )
}