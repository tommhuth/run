import React, { useState } from "react"
import SimulatedBox from "../SimulatedBox"
import { useRandomPosition } from "../../data/hooks"
import random from "../../data/random"

export default function EmptyBlock({
    start,
    end,
    depth
}) {
    let [obsticlePos] = useRandomPosition([-5, 3, end-1], [5, 4, end])
    let [height] = useState(random.integer(2, 6))

    return (
        <>
            <SimulatedBox size={[10, 5, depth]} position={[0, -2.5, start + depth / 2]} />
            <SimulatedBox mass={1} size={[2, height, 2]} position={obsticlePos} />
        </>
    )
}