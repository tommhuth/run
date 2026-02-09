import { floorMaterial } from "@components/materials/shared"
import { ShapeDefinition, useBody } from "@data/cannon"
import { useStore } from "@data/store"
import { useFrame } from "@react-three/fiber"
import { Box, Plane, Quaternion, Vec3 } from "cannon-es"

import { ROAD_FORWARD_EDGE } from "./Road"
import { ROAD_HEIGHT, ROAD_WIDTH } from "./RoadSegment"

const size = 1000
const floorDefinition: ShapeDefinition = [
    [new Plane(), new Vec3(), new Quaternion().setFromEuler(-Math.PI * .5, 0, 0)]
]


const roadPlaceholder = new Box(new Vec3(ROAD_WIDTH / 2, ROAD_HEIGHT / 2, 50))

export default function Ground() {
    useBody({
        mass: 0,
        definition: floorDefinition,
        active: true
    })

    const [, body] = useBody({
        mass: 0,
        definition: roadPlaceholder,
        active: true
    })

    useFrame(() => {
        const p = useStore.getState().player.vehicle?.chassisBody

        if (p) {
            body.position.set(
                0, ROAD_HEIGHT / 2, p.position.z + ROAD_FORWARD_EDGE * .95 + 25
            )
        }
    })

    return (
        <mesh
            position={[0, -.5, 0]}
            castShadow
            receiveShadow
            material={floorMaterial}
        >
            <boxGeometry args={[size, 1, size, 1, 1, 1]} />
        </mesh>
    )
}
