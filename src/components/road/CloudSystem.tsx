import CloudMaterial from "@components/materials/CloudMaterial"
import { setMatrixAt } from "@components/materials/helpers"
import { store } from "@data/store"
import { extractRotation, ndelta } from "@data/utils"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { useMemo, useRef } from "react"
import { InstancedMesh, PlaneGeometry } from "three"
import { damp } from "three/src/math/MathUtils.js"

import { ROAD_FORWARD_EDGE } from "./const"

interface Cloud {
    id: string
    index: number
    position: Tuple3
    scale: Tuple3
    speed: number
    damping: number
}

const aspect = 255 / 142
const geometry = new PlaneGeometry(1, 1, 1, 1)

geometry.rotateY(Math.PI)

export default function CloudSystem({ count = 25 }) {
    const ref = useRef<InstancedMesh>(null)
    const clouds = useMemo(() => {
        return Array.from({ length: count }).map((i, index) => {
            const width = random.integer(10, 15)
            const height = width * (1 / aspect)

            return {
                id: random.id(),
                index,
                position: [
                    random.float(-30, 30),
                    height * .85,
                    index * (ROAD_FORWARD_EDGE / count)
                ],
                speed: random.float(1, 3),
                damping: 3,
                scale: [width, height, 1]
            } satisfies Cloud
        })
    }, [count])

    useFrame((state, delta) => {
        const { player: { vehicle } } = store.getState()

        if (!ref.current || !vehicle) {
            return
        }

        const rotation = extractRotation(vehicle.chassisBody.quaternion)
        const horizontalEdge = 45
        const backEdge = 10

        for (const { position, speed, damping, index, scale } of clouds) {
            position[1] = damp(ref.current.position.y, 1, damping, ndelta(delta))
            position[0] -= ndelta(delta) * speed

            if (position[0] < -horizontalEdge) {
                position[0] = horizontalEdge
            }

            if (position[2] < vehicle.chassisBody.position.z - backEdge) {
                position[0] = random.float(-horizontalEdge, horizontalEdge)
                position[1] = 0
                position[2] += ROAD_FORWARD_EDGE
            }

            setMatrixAt({
                position,
                index,
                scale,
                instance: ref.current,
                rotation: [0, rotation.y, 0]
            })
        }
    })

    return (
        <instancedMesh
            ref={ref}
            userData={{ ignoreDepthWrite: true }}
            args={[geometry, undefined, count]}
            frustumCulled={false}
        >
            <CloudMaterial attach="material" />
        </instancedMesh>
    )
}
