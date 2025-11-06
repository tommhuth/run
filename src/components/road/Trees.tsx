import model from "@assets/models/trees.glb"
import { useBody } from "@data/cannon"
import { store } from "@data/store"
import { useTransitionedState } from "@data/utils"
import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { Box, Vec3 } from "cannon-es"

import { ROAD_CENTER_X } from "./Road"

const interval = 90

export function Trees({ count = 12 }) {
    let [trees, setTrees] = useTransitionedState(() => {
        return Array.from({ length: count }).fill(null).map(() => {
            let x = random.integer(ROAD_CENTER_X + 4, ROAD_CENTER_X + 12)
            let z = random.integer(-5, interval)
            let y = 0

            return {
                id: random.id(),
                position: [x * random.pick(-1, 1), y, z] as Tuple3,
                type: random.pick(0, 1, 2, 3, 4, 5),
                scale: random.float(1.25, 2),
                active: false,
                rotation: [0, random.float(0, Math.PI * 2), 0]
            }
        })
    })

    return trees.map((i) => {
        return (
            <Tree
                key={i.id}
                {...i}
                update={(data) => {
                    setTrees([
                        ...trees.filter(j => j.id !== i.id),
                        {
                            ...trees.find(j => j.id === i.id),
                            ...data
                        }
                    ])
                }}
            />
        )
    })
}

const shape = new Box(new Vec3(.4, 5, .4))

export function Tree({
    type = 0,
    update,
    position,
    active = false,
    rotation,
    scale = 1
}) {
    const { nodes, materials } = useGLTF(model)

    useBody({
        position,
        active,
        rotation,
        mass: 0,
        definition: shape,
    })

    useFrame(() => {
        let { player: { vehicle } } = store.getState()

        if (!vehicle) {
            return
        }

        let [, , z] = position
        let newActive = Math.abs(vehicle.chassisBody.position.z - z) < 15

        if (vehicle.chassisBody.position.z > z + 2) {
            newActive = false
        }

        if (active !== newActive) {
            update({ active: newActive })
        }
    })

    useFrame(() => {
        let { player } = store.getState()
        let buffer = 8
        let [, y, z] = position

        if (!player.vehicle) {
            return
        }

        if (z < player.vehicle.chassisBody.position.z - buffer) {
            update({
                position: [
                    random.integer(ROAD_CENTER_X + 4, ROAD_CENTER_X + 12) * random.pick(-1, 1),
                    y,
                    z + 90 + random.integer(-5, 5)
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
                geometry={nodes.tree5g.geometry}
                material={materials._trees_normal}
                visible={type === 0}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree4g.geometry}
                material={materials._trees_normal}
                visible={type === 1}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree3g.geometry}
                material={materials._trees_normal}
                visible={type === 2}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree2g.geometry}
                material={materials._trees_normal}
                visible={type === 3}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree6g.geometry}
                material={materials._trees_normal}
                visible={type === 4}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.tree1.geometry}
                material={materials._trees_normal}
                visible={type === 5}
            />
        </group>
    )
}

useGLTF.preload(model)
