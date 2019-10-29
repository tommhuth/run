import React, { useState } from "react"
import SimulatedBox from "../SimulatedBox"
import { useRandomVector } from "../../data/hooks"
import random from "../../data/random"

export default function EmptyBlock({
    start,
    end,
    depth
}) {
    let [obsticlePosition] = useRandomVector([-5, 3, end - 1], [5, 4, end])
    let [height] = useState(random.integer(2, 6))
    let [width] = useState(random.integer(5, 8))
    let [towerSize] = useRandomVector([3, 21, 3], [5, 24, 4])
    let [towerX] = useState(() => random.pick([width / 2, -width / 2]))
    let [towerPosition] = useRandomVector(
        [towerX, -8, start + 2],
        [towerX, -10, end - 2]
    )
    let [y] = useState(random.integer(-1, 1))
    let [x] = useState(random.integer(-1, 1))

    return (
        <>
            {/* floor */}
            <SimulatedBox
                size={[width, 20, depth]}
                position={[x, -10 + y, start + depth / 2]}
            />
            {/* tower */}
            <SimulatedBox
                size={towerSize}
                position={towerPosition}
            />

            {/* obstical 
            <SimulatedBox
                mass={1}
                size={[2, height, 2]}
                position={obsticlePosition}
            />*/}
        </>
    )
}