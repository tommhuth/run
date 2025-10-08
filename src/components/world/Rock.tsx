import model from "@assets/models/rock1.glb"
import { useBody } from "@data/cannon"
import { store } from "@data/store"
import useWaterIntersection from "@data/useWaterIntersecton"
import { ndelta } from "@data/utils"
import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { gray } from "@src/materials"
import { GLTFModel, Tuple3 } from "@src/types/global"
import { Cylinder } from "cannon-es"
import { memo, startTransition, useEffect, useMemo, useState } from "react"
import { mergeRefs } from "react-merge-refs"
import { damp } from "three/src/math/MathUtils.js"

export interface RockProps {
    position: Tuple3
    scale: number
    id: string
}

const baseSize = [2, 16, 2]

function Rock({
    position: [x, y, z],
    scale = 1
}: RockProps) {
    const { nodes } = useGLTF(model) as unknown as GLTFModel<["rock1"]>
    const { damping, rotation } = useMemo(() => {
        return {
            rotation: random.float(0, Math.PI * 2),
            damping: random.float(2, 7) * (2 - scale)
        }
    }, [x, y, z])
    const rockRef = useWaterIntersection({
        size: [baseSize[0] * scale, baseSize[1] * scale, baseSize[2] * scale],
        type: "circle",
        extension: .35 * scale
    })
    const [active, setActive] = useState(false)
    const definition = useMemo(() => {
        const radius = baseSize[0] / 2 * scale

        return new Cylinder(radius, radius, baseSize[1] * scale, 7)
    }, [scale])
    const [bodyRef, body] = useBody({
        mass: 0,
        definition,
        rotation: [0, rotation, 0],
        position: [x, y - 10, z],
        active
    })
    const ref = mergeRefs([bodyRef, rockRef])

    useEffect(() => {
        let minDistance = Infinity
        const { path } = store.getState()
        let closest: Tuple3 = [0, 0, 0]

        for (const { position } of path) {
            const distance = Math.abs(position[2] - z)

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

export default memo(Rock)
