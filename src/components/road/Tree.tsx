import model from "@assets/models/trees.glb"
import { treeMaterial } from "@components/materials/shared"
import { useBody } from "@data/cannon"
import { store } from "@data/store"
import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Box, Vec3 } from "cannon-es"
import { memo } from "react"
import { Mesh } from "three"
import { GLTF } from "three/examples/jsm/Addons.js"

import { ROAD_CENTER_X, ROAD_FORWARD_EDGE } from "./Road"

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

function Tree({
    type = 0,
    update,
    position,
    active = false,
    rotation,
    scale = 1,
    id
}) {
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
            update({ active: newActive }, id)
        }
    })

    useFrame(() => {
        const { player } = store.getState()
        const buffer = 14
        const [, y, z] = position

        if (!player.vehicle) {
            return
        }

        if (z < player.vehicle.chassisBody.position.z - buffer) {
            update({
                position: [
                    random.integer(ROAD_CENTER_X + 4, ROAD_CENTER_X + 12) * random.pick(-1, 1),
                    y,
                    z + ROAD_FORWARD_EDGE + random.integer(-5, 5)
                ],
                scale: random.float(1.25, 2),
                active: false
            }, id)
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
                visible={type === 0}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree4.geometry}
                material={treeMaterial}
                visible={type === 1}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree3.geometry}
                material={treeMaterial}
                visible={type === 2}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree2.geometry}
                material={treeMaterial}
                visible={type === 3}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree6.geometry}
                material={treeMaterial}
                visible={type === 4}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree1.geometry}
                material={treeMaterial}
                visible={type === 5}
            />
        </group>
    )
}

export default memo(Tree)

useGLTF.preload(model)
