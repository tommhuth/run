import { floorMaterial } from "@components/materials/shared"
import { ShapeDefinition, useBody } from "@data/cannon"
import { useStore } from "@data/store"
import { useFrame } from "@react-three/fiber"
import { Box, Plane, Quaternion, Vec3 } from "cannon-es"
import { useRef } from "react"
import { Mesh } from "three"

import { ROAD_BASE_WIDTH, ROAD_FORWARD_EDGE, ROAD_HEIGHT } from "./const"

const size = 200
const floorDefinition: ShapeDefinition = [
    [new Plane(), new Vec3(), new Quaternion().setFromEuler(-Math.PI * .5, 0, 0)]
]
const roadPlaceholder = new Box(new Vec3(ROAD_BASE_WIDTH / 2, ROAD_HEIGHT / 2, 50))

export default function Ground() {
    const groundRef = useRef<Mesh>(null)
    const [, roadBackup] = useBody({
        mass: 0,
        definition: roadPlaceholder,
    })

    useBody({
        mass: 0,
        definition: floorDefinition,
        position: [0, 0, 0],
    })

    useFrame(() => {
        const player = useStore.getState().player.vehicle?.chassisBody

        if (player && groundRef.current) {
            groundRef.current.position.z = player.position.z
            roadBackup.position.set(
                0, ROAD_HEIGHT / 2, player.position.z + ROAD_FORWARD_EDGE * .95 + 25
            )
        }
    })

    return (
        <mesh
            ref={groundRef}
            position-y={-.5}
            castShadow
            receiveShadow
            material={floorMaterial}
        >
            <boxGeometry args={[size, 1, size, 1, 1, 1]} />
        </mesh>
    )
}
