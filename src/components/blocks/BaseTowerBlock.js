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
    let [towerRadius] = useState(random.integer(2, 4))
    let [towerHeight] = useState(random.integer(22, 25))
    let [towerX] = useState(() => random.pick([width / 1.5, -width / 1.5]))
    let [towerPosition] = useRandomVector(
        [towerX, -8, start + 2],
        [towerX, -10, end - 2]
    )
    let [otherTowerZ] = useState(random.integer(start, end))
    let [otherTowerY] = useState(random.integer(-2, 2))
    let [y] = useState(random.integer(-1, 1))
    let [x] = useState(random.integer(-1, 1))

    return (
        <>
            {/* floor */}
            <SimulatedCylinder
                height={20}
                segments={12}
                radius={Math.max(width, depth) / 2}
                position={[x, -10 + y, start + depth / 2]}
            />

            {/* tower */}
            <SimulatedCylinder
                height={towerHeight}
                segments={8}
                radius={towerRadius}
                position={towerPosition}
            />

            {/* tower */}
            <SimulatedCylinder
                height={towerHeight - 1}
                segments={8}
                radius={towerRadius}
                position={[towerPosition[0] * -2, towerPosition[1] + otherTowerY, otherTowerZ]}
            />
        </>
    )
}