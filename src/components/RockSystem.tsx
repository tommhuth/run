import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useLayoutEffect, useState, useEffect, startTransition } from "react"
import { gray } from "../materials"
import { GLTFModel, Tuple2, Tuple3 } from "../types/global"
import { damp } from "three/src/math/MathUtils.js"

import model from "@assets/models/rock1.glb"
import { ndelta } from "@data/utils"
import useWaterIntersection from "@data/useWaterIntersecton"
import { store } from "@data/store"
import { useBody } from "@data/cannon"
import { mergeRefs } from "react-merge-refs"
import { Cylinder } from "cannon-es"

let baseSize = [2, 16, 2]

interface RockProps {
    position: Tuple3
    scale: number
    id: string
}

function Rock({
    position: [x, y, z],
    scale = 1
}: RockProps) {
    let { nodes } = useGLTF(model) as unknown as GLTFModel<["rock1"]>
    let { damping, rotation } = useMemo(() => {
        return {
            rotation: random.float(0, Math.PI * 2),
            damping: random.float(2, 7) * (2 - scale)
        }
    }, [x, y, z])
    let rockRef = useWaterIntersection({
        size: [baseSize[0] * scale, baseSize[1] * scale, baseSize[2] * scale],
        type: "circle",
        extension: .35 * scale
    })
    let [active, setActive] = useState(false)
    let definition = useMemo(() => {
        let radius = baseSize[0] / 2 * scale

        return new Cylinder(radius, radius, baseSize[1] * scale, 7)
    }, [scale])
    let [bodyRef, body] = useBody({
        mass: 0,
        definition,
        rotation: [0, rotation, 0],
        position: [x, y - 10, z],
        active
    })
    let ref = mergeRefs([bodyRef, rockRef])

    useEffect(() => {
        let minDistance = Infinity
        let { path } = store.getState()
        let closest: Tuple3 = [0, 0, 0]

        for (let { position } of path) {
            let distance = Math.abs(position[2] - z)

            if (distance < minDistance) {
                minDistance = distance
                closest = position
            }
        }

        startTransition(() => {
            setActive(Math.abs(closest[0] - x) < 7)
        })
    }, [z])

    useFrame((state, delta) => {
        if (!rockRef.current) {
            return
        }

        body.position.y = damp(
            body.position.y,
            y,
            damping,
            ndelta(delta)
        )
    })

    return (
        <mesh
            castShadow
            receiveShadow
            geometry={nodes.rock1.geometry}
            material={gray}
            dispose={null}
            position-x={x}
            position-z={z}
            scale={scale}
            rotation-y={rotation}
            ref={ref}
        />
    )
}

const xRange: Tuple2 = [4, 13]
const yRange: Tuple2 = [1, 8]
const scaleRange: Tuple2 = [1, 1.25]

export default function RockSystem({ count = 25 }) {
    let [rocks, setRocks] = useState(() => {
        return Array.from({ length: count })
            .fill(null)
            .map(() => {
                return {
                    id: random.id(),
                    scale: random.float(...scaleRange),
                    position: [
                        random.float(...xRange) * random.pick(-1, 1),
                        random.integer(...yRange) - baseSize[1] / 2 - 4.5,
                        random.float(-1, 20)
                    ]
                } satisfies RockProps
            })
    })

    useFrame(({ camera }) => {
        let { path, state } = store.getState()
        let forward = path[0]

        if (state != "running") {
            return
        }

        for (let { position, id } of rocks) {
            if (position[2] < camera.position.z - 2) {
                setRocks([
                    ...rocks.filter(i => i.id !== id),
                    {
                        ...rocks.find(i => i.id === id) as RockProps,
                        scale: random.float(...scaleRange),
                        position: [
                            forward.position[0] + random.float(...xRange) * random.pick(-1, 1),
                            random.integer(...yRange) - baseSize[1] / 2 - 4.5,
                            position[2] + 25
                        ]
                    }
                ])
            }
        }
    })

    return rocks.map(i => {
        return <Rock key={i.id} {...i} />
    })
}