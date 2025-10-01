import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useLayoutEffect, memo } from "react"
import { gray } from "../materials"
import { GLTFModel, Tuple3 } from "../types/global"
import { damp } from "three/src/math/MathUtils.js"

import model from "@assets/models/rock1.glb"
import { ndelta } from "@data/utils"
import useWaterIntersection from "@data/useWaterIntersecton"

let baseSize = [1.95, 28, 1.95]

function Rock1({
    position: [x, y, z],
}: { position: Tuple3 }) {
    let { nodes } = useGLTF(model) as unknown as GLTFModel<["rock1"]>
    let { position, damping, scale, rotation } = useMemo(() => {
        let scale = random.float(.5, 1.5)

        return {
            position: [
                random.pick(5, 7, 10, 14) * random.pick(-1, 1) + x,
                y + random.integer(-3, 3) - baseSize[1] / 2 * scale,
                z + random.integer(-5, 5)
            ] as Tuple3,
            rotation: random.float(0, Math.PI * 2),
            scale,
            damping: random.float(2, 7) * (2 - scale)
        }
    }, [x, y, z])
    let rockRef = useWaterIntersection({
        size: [baseSize[0] * scale, baseSize[1] * scale, baseSize[2] * scale],
        type: "circle",
        extension: .85 * scale,
        threshold: .15
    })

    useLayoutEffect(() => {
        if (!rockRef.current) {
            return
        }

        rockRef.current.position.y = position[1] - 10
    }, [])

    useFrame((state, delta) => {
        if (!rockRef.current) {
            return
        }

        rockRef.current.position.y = damp(
            rockRef.current.position.y,
            position[1],
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
            position-x={position[0]}
            position-z={position[2]}
            scale={scale}
            rotation-y={rotation}
            ref={rockRef}
        />
    )
}

export default memo(Rock1)