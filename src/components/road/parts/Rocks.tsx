
import PlaceGrid from "@data/PlaceGrid"
import { RockObject } from "@data/store"
import random from "@huth/random"
import { Tuple3 } from "@src/types/global"
import { useMemo } from "react"
import { Fragment } from "react/jsx-runtime"

import RoadSegment from "../RoadSegment"
import Rock from "../Rock"
import StreetLight from "../StreetLight"

export default function RocksPart({ position, depth }) {
    const { rocks } = useMemo(() => {
        const leftGrid = new PlaceGrid([2, 5], 4, [position[0] + 10, 0, position[2] + depth / 2])
        const rightGrid = new PlaceGrid([2, 5], 4, [position[0] - 10, 0, position[2] + depth / 2])
        const rocks: RockObject[] = []

        for (const side of [-1, 1]) {
            const grid = side === -1 ? leftGrid : rightGrid
            const positions = grid.getRandomPositions()
            const rockCount = random.pick(1, 2, 5, 7)

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
        }

        return { rocks, leftGrid, rightGrid }
    }, [])

    return (
        <>
            {rocks.map(i => {
                return (
                    <Rock
                        key={i.id}
                        {...i}
                    />
                )
            })}

            {Array.from({ length: 2 }).map((i, index) => {
                const x = 3.75
                const y = .2
                const z = position[2] + index * 20

                return (
                    <Fragment key={index}>
                        <StreetLight
                            position={[x, y, z]}
                            scale={7}
                            rotation={[0, Math.PI * .5, 0]}
                        />
                        <StreetLight
                            position={[-x, y, z]}
                            scale={7}
                            rotation={[0, -Math.PI * .5, 0]}
                        />
                    </Fragment>
                )
            })}

            <RoadSegment
                position={[
                    position[0],
                    position[1],
                    position[2] + depth / 2,
                ]}
            />
        </>
    )
}
