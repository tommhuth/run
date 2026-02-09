import model from "@assets/models/trees.glb"
import { treeMaterial } from "@components/materials/shared"
import { useBody } from "@data/cannon"
import { grid } from "@data/PlacementGrid"
import { store, TreeObject } from "@data/store"
import { updateRoadObject } from "@data/store/actions"
import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Box, Vec3 } from "cannon-es"
import { memo } from "react"
import { Mesh } from "three"
import { GLTF } from "three/examples/jsm/Addons.js"

import { ROAD_EDGE_X, ROAD_FORWARD_EDGE } from "./Road"

const shape = new Box(new Vec3(.25, 5, .25))

type GLTFResult = GLTF & {
    nodes: {
        tree1: Mesh
        tree2: Mesh
        tree3: Mesh
        tree4: Mesh
        tree5: Mesh
        tree6: Mesh
    }
}

const offset = 1.5

export function initializeTrees() {
    return Array.from({ length: 12 }).fill(null).map(() => {
        const side = random.pick(-1, 1)
        const [x, z] = grid.getRandomPosition([2, 5], [-1, ROAD_FORWARD_EDGE])

        return {
            id: random.id(),
            position: [
                (x + ROAD_EDGE_X + offset) * side,
                random.float(-1, 0),
                z
            ],
            treeType: random.pick(0, 1, 2, 3, 4, 5),
            scale: random.float(1.25, 2),
            active: false,
            rotation: [
                random.float(-.25, .25),
                random.float(0, Math.PI * 2),
                random.float(-.25, .1) * random.pick(-1, 1)
            ],
            type: "tree"
        } satisfies TreeObject
    })
}

function Tree({
    treeType = 0,
    position,
    active = false,
    rotation,
    scale = 1,
    id
}: TreeObject) {
    const { nodes } = useGLTF(model) as unknown as GLTFResult

    useBody({
        position,
        active,
        rotation,
        mass: 0,
        definition: shape,
    })

    useFrame(() => {
        const { player: { vehicle } } = store.getState()

        if (!vehicle) {
            return
        }

        const [, , z] = position
        let newActive = Math.abs(vehicle.chassisBody.position.z - z) < 15

        if (vehicle.chassisBody.position.z > z + 2) {
            newActive = false
        }

        if (active !== newActive) {
            updateRoadObject(id, { active: newActive },)
        }
    })

    useFrame(() => {
        const { player } = store.getState()
        const buffer = 14
        const currentZ = position[2]

        if (!player.vehicle) {
            return
        }

        if (currentZ < player.vehicle.chassisBody.position.z - buffer) {
            const playerZ = player.vehicle?.chassisBody.position.z
            const baseZ = playerZ + ROAD_FORWARD_EDGE
            const [x, z] = grid.getRandomPosition(
                [0, 10],
                [baseZ, baseZ + 3]
            )

            updateRoadObject(id, {
                position: [
                    (x + ROAD_EDGE_X + offset) * random.pick(-1, 1),
                    random.float(-1, 0),
                    z
                ],
                scale: random.float(1.25, 2),
                active: false
            })
        }
    })

    return (
        <group
            scale={scale}
            dispose={null}
            position={position}
            rotation={rotation}
        >
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree5.geometry}
                material={treeMaterial}
                visible={treeType === 0}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree4.geometry}
                material={treeMaterial}
                visible={treeType === 1}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree3.geometry}
                material={treeMaterial}
                visible={treeType === 2}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree2.geometry}
                material={treeMaterial}
                visible={treeType === 3}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree6.geometry}
                material={treeMaterial}
                visible={treeType === 4}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree1.geometry}
                material={treeMaterial}
                visible={treeType === 5}
            />
        </group>
    )
}

export default memo(Tree)

useGLTF.preload(model)
