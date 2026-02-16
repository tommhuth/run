import PlaceGrid from "@data/PlaceGrid"
import { RockObject, TreeObject } from "@data/store"
import random from "@huth/random"
import { Tuple3 } from "@src/types/global"
import { Suspense, useMemo } from "react"
import { Fragment } from "react/jsx-runtime"

import RoadSegment from "../RoadSegment"
import Rock from "../Rock"
import StreetLight from "../StreetLight"
import Tree from "../Tree"

export default function ForestPart({ position, depth }) {
    const { trees, rocks } = useMemo(() => {
        const leftGrid = new PlaceGrid([2, 5], 4, [position[0] + 10, 0, position[2] + depth / 2])
        const rightGrid = new PlaceGrid([2, 5], 4, [position[0] - 10, 0, position[2] + depth / 2])
        const trees: TreeObject[] = []
        const rocks: RockObject[] = []

        for (const side of [-1, 1]) {
            const treeCount = random.pick(3, 2, 2, 6, 8)
            const grid = side === -1 ? leftGrid : rightGrid
            const positions = grid.getRandomPositions()

            for (let i = 0; i < treeCount; i++) {
                const position = positions.pop() as Tuple3

                trees.push({
                    id: random.id(),
                    position: [
                        position[0] + random.float(0, 2) * side,
                        position[1],
                        position[2] + random.float(-1, 1)
                    ],
                    scale: random.float(1.25, 2.25),
                    treeType: random.integer(0, 5),
                    rotation: [
                        random.float(-.25, .25),
                        random.float(0, Math.PI * 2),
                        random.float(-.25, .1) * random.pick(-1, 1)
                    ],
                })
            }

            const rockCount = random.integer(0, 2)

            for (let i = 0; i < rockCount; i++) {
                const position = positions.pop() as Tuple3
                const radius = random.pick(1, 1.5, 2.5, 4, 1.85, 2, 3, 2.4)

                rocks.push({
                    position: [
                        position[0] + random.float(0, 2) * side + radius * -side * .2,
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

        return { trees, rocks, leftGrid, rightGrid }
    }, [])

    return (
        <Suspense fallback={null}>
            {trees.map(i => {
                return (
                    <Tree
                        key={i.id}
                        {...i}
                    />
                )
            })}
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
        </Suspense>
    )
}
