import model from "@assets/models/rock.glb"
import { rockMaterial } from "@components/materials/shared"
import { useBody } from "@data/cannon"
import { grid } from "@data/PlacementGrid"
import { RockObject, store } from "@data/store"
import { updateRoadObject } from "@data/store/actions"
import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Sphere } from "cannon-es"
import { memo, useMemo } from "react"

import { ROAD_EDGE_X, ROAD_FORWARD_EDGE } from "./Road"

export function initializeRocks() {
    return Array.from({ length: 18 }).fill(null).map(() => {
        const radius = random.pick(1, 1.5, 2.5, 4, 1.85, 2, 3, 2.4)
        const [x, z] = grid.getRandomPosition([0, 10], [-1, ROAD_FORWARD_EDGE])

        return {
            id: random.id(),
            position: [
                (x + ROAD_EDGE_X + radius) * random.pick(-1, 1),
                random.float(0, .35),
                z
            ],
            rotation: [
                random.pick(Math.PI, 0),
                random.float(0, Math.PI * 2),
                random.pick(Math.PI, 0)
            ],
            radius,
            scale: [0, random.float(.85, 1.15), 0],
            active: false,
            type: "rock"
        } satisfies RockObject
    })
}

function Rock({
    position,
    scale,
    rotation,
    radius,
    active = false,
    id,
}: RockObject) {
    const { nodes } = useGLTF(model)
    const shape = useMemo(() => {
        return new Sphere(radius * .85)
    }, [])

    useBody({
        mass: 0,
        position,
        definition: shape,
        rotation,
        active,
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

        if (!player.vehicle) {
            return
        }

        const buffer = radius * 4
        const [, , currentZ] = position

        if (currentZ < player.vehicle.chassisBody.position.z - buffer) {
            const playerZ = player.vehicle?.chassisBody.position.z
            const baseZ = playerZ + ROAD_FORWARD_EDGE
            const [x, z] = grid.getRandomPosition(
                [0, 10],
                [baseZ + radius, baseZ + radius + 4]
            )

            updateRoadObject(id, {
                position: [
                    (x + ROAD_EDGE_X + radius) * random.pick(-1, 1),
                    random.float(0, radius * .25),
                    z
                ],
                active: false
            })
        }
    })

    return (
        <mesh
            castShadow
            receiveShadow
            geometry={nodes.rock.geometry}
            scale={radius * 2}
            scale-y={radius * 2 * scale[1]}
            material={rockMaterial}
            dispose={null}
            position={position}
            rotation={rotation}
        />
    )
}

export default memo(Rock)
