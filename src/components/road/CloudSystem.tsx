import CloudMaterial from "@components/materials/CloudMaterial"
import { setMatrixAt } from "@components/materials/helpers"
import { store } from "@data/store/store"
import { extractRotation, ndelta } from "@data/utils"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { useMemo, useRef } from "react"
import { InstancedMesh, PlaneGeometry, Vector3 } from "three"
import { damp } from "three/src/math/MathUtils.js"

import { ROAD_FORWARD_EDGE } from "./const"

interface Cloud {
    id: string
    position: Vector3
    scale: Tuple3
    speed: number
    damping: number
}

const aspect = 255 / 142
const geometry = new PlaneGeometry(1, 1, 1, 1)
const horizontalEdge = 40

geometry.rotateY(Math.PI)

export default function CloudSystem({ count = 50 }) {
    const ref = useRef<InstancedMesh>(null)
    const clouds = useMemo(() => {
        return Array.from({ length: count }).map((i, index) => {
            const width = random.integer(10, 15)
            const height = width * (1 / aspect)

            return {
                id: random.id(),
                position: new Vector3(
                    random.float(-horizontalEdge, horizontalEdge),
                    height * .85,
                    ROAD_FORWARD_EDGE - index * (ROAD_FORWARD_EDGE / count)
                ),
                speed: random.float(1, 3),
                damping: 3,
                scale: [width, height, 1]
            } satisfies Cloud
        })
    }, [count])

    useFrame(({ camera }, delta) => {
        const { player: { vehicle } } = store.getState()

        if (!ref.current || !vehicle) {
            return
        }

        const rotation = extractRotation(vehicle.chassisBody.quaternion)
        const backEdge = 10
        const sortedClouds = clouds.sort((a, b) => {
            return camera.position.distanceToSquared(b.position)
                - camera.position.distanceToSquared(a.position)
        })

        for (let index = 0; index < sortedClouds.length; index++) {
            const { position, speed, damping, scale } = sortedClouds[index]

            position.y = damp(ref.current.position.y, 1, damping, ndelta(delta))
            position.x -= ndelta(delta) * speed

            setMatrixAt({
                position,
                index,
                scale,
                instance: ref.current,
                rotation: [0, rotation.y, 0]
            })

            if (position.x < -horizontalEdge) {
                position.x = horizontalEdge
            }

            if (position.z < vehicle.chassisBody.position.z - backEdge) {
                position.x = random.float(-horizontalEdge, horizontalEdge)
                position.y = 0
                position.z += ROAD_FORWARD_EDGE
            }
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
