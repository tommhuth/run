import model from "@assets/models/rock.glb"
import { rockMaterial } from "@components/materials/shared"
import { useBody } from "@data/cannon"
import { store } from "@data/store"
import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Sphere } from "cannon-es"
import { memo, useMemo } from "react"

import { ROAD_CENTER_X, ROAD_EDGE_X, ROAD_FORWARD_EDGE } from "./Road"

function Rock({
    position,
    scaly,
    rotation,
    radius,
    update,
    active = false,
    id,
}) {
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
            update({ active: newActive }, id)
        }
    })

    useFrame(() => {
        const { player } = store.getState()

        if (!player.vehicle) {
            return
        }

        const buffer = radius * 4
        const [, , z] = position

        if (z < player.vehicle.chassisBody.position.z - buffer) {
            update({
                position: [
                    random.integer(ROAD_EDGE_X + radius, ROAD_EDGE_X + 9) * random.pick(-1, 1),
                    random.float(0, radius * .25),
                    z + ROAD_FORWARD_EDGE + random.integer(-5, 5)
                ],
                active: false
            }, id)
        }
    })

    return (
        <mesh
            castShadow
            receiveShadow
            geometry={nodes.rock.geometry}
            scale={radius * 2}
            scale-y={radius * 2 * scaly}
            material={rockMaterial}
            dispose={null}
            position={position}
            rotation={rotation}
        />
    )
}

export default memo(Rock)
