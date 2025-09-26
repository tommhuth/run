import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef, useLayoutEffect } from "react"
import { gray } from "../materials"
import { Tuple3 } from "../types/global"
import { damp } from "three/src/math/MathUtils.js"

import model from "@assets/models/rock1.glb"
import Cloud from "./Cloud"
import { useFoam } from "./PathSection"

export function Rock1({
    position: [x, y, z],
    depthTexture
}: { position: Tuple3 }) {
    const { nodes } = useGLTF(model)
    let should = useMemo(() => random.boolean(.5), [])
    const { position, damping, scale, rotation } = useMemo(() => {
        let scale = random.float(.5, 1.5)

        return {
            position: [
                random.pick(5, 7, 10, 14) * random.pick(-1, 1) + x,
                y + random.integer(0, 6),
                z + random.integer(-5, 5)
            ],
            rotation: random.float(0, 3),
            scale,
            damping: random.float(2, 7) * (2 - scale)
        }
    }, [x, y, z])

    let ref2 = useFoam([scale, scale, scale])
    let ref = useRef(null)


    useLayoutEffect(() => {
        ref.current.position.y = y - 10
    }, [])

    useFrame((state, delta) => {
        ref.current.position.y = damp(ref.current.position.y, position[1], damping, delta)
    })


    let edge = useMemo(() => random.integer(6, 8), [])
    let off = useMemo(() => random.float(.1, .5), [])

    return (
        <>
            {should && (
                <Cloud
                    position={[position[0], position[1] + 7, position[2] + 1 - off]}
                    depthTexture={depthTexture}
                />
            )}
            <group
                position-x={position[0]}
                position-z={position[2]}
                scale={scale}
                rotation-y={rotation}
                dispose={null}
                ref={ref}
            >
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.rock1.geometry}
                    material={gray}
                />
            </group>
            <mesh
                position={position}
                position-y={-4.5}
                scale={scale}
                ref={ref2}
            >
                <cylinderGeometry args={[1.25, 1.25, .01, edge, 1]} />
                <meshBasicMaterial color="white" />
            </mesh>
        </>
    )
}
