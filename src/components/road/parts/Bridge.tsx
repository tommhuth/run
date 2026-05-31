
import model from "@assets/models/railing.glb"
import { floorMaterial } from "@components/materials/shared"
import { ShapeDefinition, useBody } from "@data/cannon"
import PlaceGrid from "@data/PlaceGrid"
import { RockObject, useStore } from "@data/store/store"
import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { GLTFModel, Tuple3 } from "@src/types/global"
import { Box, Vec3 } from "cannon-es"
import { Suspense, useMemo } from "react"

import { ROAD_BASE_WIDTH, ROAD_DEPTH, ROAD_HEIGHT } from "../const"
import Rock from "../Rock"
import StreetLight from "../StreetLight"

const roadBase = new Box(new Vec3(ROAD_BASE_WIDTH / 2, ROAD_HEIGHT / 2, ROAD_DEPTH / 2))
const railings: ShapeDefinition = [
    [new Box(new Vec3(.25 / 2, .5 / 2, ROAD_DEPTH / 2)), new Vec3(ROAD_BASE_WIDTH / 2 * .95, 0, 0)],
    [new Box(new Vec3(.25 / 2, .5 / 2, ROAD_DEPTH / 2)), new Vec3(-ROAD_BASE_WIDTH / 2 * .95, 0, 0)],
]

export default function BridgePart({ position, depth }) {
    const { nodes } = useGLTF(model) as unknown as GLTFModel<["railing"]>
    const roadMaterial = useStore(i => i.materials.road)
    const { rocks } = useMemo(() => {
        const leftGrid = new PlaceGrid([2, 5], 4, [position[0] + 10, 0, position[2] + depth / 2])
        const rightGrid = new PlaceGrid([2, 5], 4, [position[0] - 10, 0, position[2] + depth / 2])
        const rocks: RockObject[] = []

        for (const side of [-1, 1]) {
            const grid = side === -1 ? leftGrid : rightGrid
            const positions = grid.getRandomPositions()
            const rockCount = random.pick(0, 0, 1, 1, 2, 3)

            for (let i = 0; i < rockCount; i++) {
                const position = positions.pop() as Tuple3
                const radius = random.pick(1, 1.5, 2.5, 4, 1.85, 2)

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

    useBody({
        position: [position[0], position[1] + ROAD_HEIGHT / 2, position[2] + depth / 2],
        definition: roadBase,
        mass: 0
    })

    useBody({
        position: [position[0], position[1] + ROAD_HEIGHT / 2 + .75, position[2] + depth / 2],
        definition: railings,
        mass: 0
    })

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

            <StreetLight
                position={[3.75, ROAD_HEIGHT, position[2]]}
                rotation={[0, Math.PI * .5, 0]}
                fixed
            />
            <StreetLight
                position={[-3.75, ROAD_HEIGHT, position[2]]}
                rotation={[0, -Math.PI * .5, 0]}
                fixed
            />

            {[-1, 1].map(index => {
                return (
                    <mesh
                        position={[ROAD_BASE_WIDTH / 2 * index * .95, ROAD_HEIGHT + .5, position[2] + depth / 2]}
                        geometry={nodes.railing.geometry}
                        castShadow
                        receiveShadow
                        key={index}
                        material={floorMaterial}
                    />
                )
            })}

            <mesh
                position={[
                    position[0],
                    position[1] + ROAD_HEIGHT / 2,
                    position[2] + depth / 2
                ]}
                castShadow
                receiveShadow
                material={roadMaterial}
            >
                <boxGeometry args={[ROAD_BASE_WIDTH, ROAD_HEIGHT, ROAD_DEPTH]} />
            </mesh>
        </Suspense>
    )
}
