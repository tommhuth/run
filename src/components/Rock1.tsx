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
import { CylinderGeometry, MeshLambertMaterial } from "three"

let white = new MeshLambertMaterial({ emissive: "#fff", emissiveIntensity: .25 })
let cylinder = new CylinderGeometry(1, 1, .01, 7, 1)

export function Rock1({
    position: [x, y, z],
}: { position: Tuple3 }) {
    let { nodes } = useGLTF(model)
    let should = useMemo(() => random.boolean(.5), [])
    let { position, damping, scale, rotation } = useMemo(() => {
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
    let rockRef = useRef(null)
    let foamRef = useFoam([scale * 1.25, scale * 1.25, scale * 1.25])

    useLayoutEffect(() => {
        rockRef.current.position.y = y - 10
    }, [])

    useFrame((state, delta) => {
        rockRef.current.position.y = damp(rockRef.current.position.y, position[1], damping, delta)
    })


    let off = useMemo(() => random.float(.1, .5), [])

    return (
        <>
            {should && (
                <Cloud
                    position={[
                        position[0],
                        position[1] + 7,
                        position[2] + 1 - off
                    ]}
                />
            )}
            <group
                position-x={position[0]}
                position-z={position[2]}
                scale={scale}
                rotation-y={rotation}
                dispose={null}
                ref={rockRef}
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
                scale={scale * 1.25}
                ref={foamRef}
                receiveShadow
                material={white}
                geometry={cylinder}
            />
        </>
    )
}
