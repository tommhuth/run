import PlaceGrid from "@data/PlaceGrid"
import { BushObject, RockObject } from "@data/store/store"
import random from "@huth/random"
import { Tuple3 } from "@src/types/global"
import { Suspense, useMemo } from "react"

import Bushes from "../Bush"
import { ROAD_HEIGHT } from "../const"
import RoadSegment from "../RoadSegment"
import Rock from "../Rock"
import StreetLight from "../StreetLight"

export default function RocksPart({ position, depth }) {
    const { rocks, bushes } = useMemo(() => {
        const leftGrid = new PlaceGrid([2, 5], 4, [position[0] + 10, 0, position[2] + depth / 2])
        const rightGrid = new PlaceGrid([2, 5], 4, [position[0] - 10, 0, position[2] + depth / 2])
        const rocks: RockObject[] = []
        const bushes: BushObject[] = []

        for (const side of [-1, 1]) {
            const grid = side === -1 ? leftGrid : rightGrid
            const positions = grid.getRandomPositions()
            const rockCount = random.pick(1, 2, 5)
            const bushCount = random.integer(0, 2)

            for (let i = 0; i < rockCount; i++) {
                const position = positions.pop() as Tuple3
                const radius = random.pick(1.5, 2.5, 4, 1.85, 2, 3, 2.4)

                rocks.push({
                    position: [
                        position[0] + random.float(0, 2) * side + radius * -side * .25,
                        position[1],
                        position[2] + random.float(-1, 1)
                    ],
                    rotation: [
                        random.pick(Math.PI, 0),
                        random.float(0, Math.PI * 2),
                        random.pick(Math.PI, 0)
                    ],
                    radius,
                    scale: [0, random.float(.85, 1.15), 0],
                    id: random.id(),
                })
            }

            for (let i = 0; i < bushCount; i++) {
                const position = positions.pop() as Tuple3
                const count = random.integer(1, 4)

                bushes.push({
                    count,
                    position,
                    id: random.id(),
                })
            }
        }

        return { rocks, bushes, leftGrid, rightGrid }
    }, [])

    return (
        <Suspense fallback={null}>
            {rocks.map(i => {
                return (
                    <Rock
                        key={i.id}
                        {...i}
                    />
                )
            })}
            {bushes.map(i => {
                return (
                    <Bushes
                        key={i.id}
                        {...i}
                    />
                )
            })}

            <StreetLight
                position={[3.75, ROAD_HEIGHT, position[2]]}
                rotation={[0, Math.PI * .5, 0]}
            />
            <StreetLight
                position={[-3.75, ROAD_HEIGHT, position[2]]}
                rotation={[0, -Math.PI * .5, 0]}
            />

            <RoadSegment
                position={[
                    position[0],
                    position[1],
                    position[2] + depth / 2,
                ]}
            />
        </Suspense>
    )
}
