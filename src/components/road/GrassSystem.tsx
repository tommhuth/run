import model from "@assets/models/grass3.glb"
import { setMatrixAt } from "@components/materials/helpers"
import { floorMaterial, grassMaterial } from "@components/materials/shared"
import { store } from "@data/store"
import { useLowerPriorityFrame } from "@data/utils"
import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { Tuple3 } from "@src/types/global"
import { useMemo, useRef } from "react"
import { InstancedMesh } from "three"

import { ROAD_FORWARD_EDGE } from "./const"

interface Grass {
    index: number
    position: Tuple3
    scale: Tuple3
    rotation: number
}

export default function GrassSystem({ count = 250 }) {
    const { nodes } = useGLTF(model)
    const instanceRef = useRef<InstancedMesh>(null)
    const items = useMemo(() => {
        return Array.from({ length: count }).map((i, index) => {
            return {
                index,
                position: [
                    random.float(6, 50) * random.pick(-1, 1),
                    0,
                    random.float(-10, ROAD_FORWARD_EDGE)
                ],
                rotation: random.float(0, Math.PI * 2),
                scale: [
                    random.float(.75, 1),
                    random.float(.5, .85),
                    random.float(.75, 1),
                ]
            } satisfies Grass
        })
    }, [count])

    useLowerPriorityFrame(() => {
        const { player: { vehicle } } = store.getState()
        const threshold = 10

        if (!instanceRef.current || !vehicle) {
            return
        }

        for (const { index, position, rotation, scale } of items) {
            if (vehicle.chassisBody.position.z > position[2] + threshold) {
                position[2] += ROAD_FORWARD_EDGE
            }

            setMatrixAt({
                index,
                position,
                scale,
                rotation: [0, rotation, 0],
                instance: instanceRef.current
            })
        }
    }, 10)

    return (
        <instancedMesh
            args={[nodes.grass.geometry, grassMaterial, count]}
            ref={instanceRef}
            frustumCulled={false}
            receiveShadow
        />
    )
}
