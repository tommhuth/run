import model from "@assets/models/leaf.glb"
import Cycler from "@data/Cycler"
import PlaceGrid from "@data/PlaceGrid"
import { RockObject, TreeObject } from "@data/store"
import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { Tuple3 } from "@src/types/global"
import { Fragment, Suspense, useMemo } from "react"

import PickupTarget from "../PickupTarget"
import RoadSegment from "../RoadSegment"
import Rock from "../Rock"
import StreetLight from "../StreetLight"
import Tree from "../Tree"

useGLTF.preload(model)

const sideCycler = new Cycler(["left", "right"])

export default function PickupPointPart({ position, depth, id }) {
    const { trees, rocks, pickupPosition } = useMemo(() => {
        const pickupSide = sideCycler.next()
        const leftGrid = new PlaceGrid([2, 3], 6, [position[0] + 11.5, 0, position[2] + depth / 2])
        const rightGrid = new PlaceGrid([2, 3], 6, [position[0] - 11.5, 0, position[2] + depth / 2])
        const trees: TreeObject[] = []
        const rocks: RockObject[] = []
        const positions = {
            left: leftGrid.getRandomPositions(),
            right: rightGrid.getRandomPositions(),
        } as const
        const pickupPosition = positions[pickupSide].pop() as Tuple3

        for (const side of [-1, 1]) {
            const treeCount = random.pick(1, 2)

            for (let i = 0; i < treeCount; i++) {
                const position = positions[side === 1 ? "right" : "left"].pop() as Tuple3

                trees.push({
                    id: random.id(),
                    position,
                    scale: random.float(1.25, 2.25),
                    treeType: random.integer(0, 5),
                    rotation: [
                        random.float(-.25, .25),
                        random.float(0, Math.PI * 2),
                        random.float(-.25, .1) * random.pick(-1, 1)
                    ],
                })
            }

            const rockCount = random.integer(1, 2)

            for (let i = 0; i < rockCount; i++) {
                const position = positions[side === 1 ? "right" : "left"].pop() as Tuple3
                const radius = random.pick(1, 1.5, 2.5, 1.75)

                rocks.push({
                    position,
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

        return { trees, rocks, leftGrid, rightGrid, pickupPosition }
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

            <PickupTarget
                pickupId={id}
                position={pickupPosition}
            />

            {Array.from({ length: 2 }).map((i, index) => {
                const x = 3.75
                const y = .2
                const z = position[2] + index * 20

                return (
                    <Fragment key={index}>
                        <StreetLight
                            position={[x, y, z]}
                            rotation={[0, Math.PI * .5, 0]}
                        />
                        <StreetLight
                            position={[-x, y, z]}
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
