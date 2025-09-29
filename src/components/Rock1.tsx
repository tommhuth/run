import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef, useLayoutEffect } from "react"
import { gray, white } from "../materials"
import { GLTFModel, Tuple3 } from "../types/global"
import { damp } from "three/src/math/MathUtils.js"

import model from "@assets/models/rock1.glb"
import { useFoam } from "./PathSection"
import { CylinderGeometry, Group } from "three"
import { ndelta } from "@data/utils"

let cylinder = new CylinderGeometry(1, 1, .01, 7, 1)

export function Rock1({
    position: [x, y, z],
}: { position: Tuple3 }) {
    let { nodes } = useGLTF(model) as unknown as GLTFModel<["rock1"]>
    let { position, damping, scale, rotation } = useMemo(() => {
        let scale = random.float(.5, 1.5)

        return {
            position: [
                random.pick(5, 7, 10, 14) * random.pick(-1, 1) + x,
                y + random.integer(0, 6),
                z + random.integer(-5, 5)
            ] as Tuple3,
            rotation: random.float(0, 3),
            scale,
            damping: random.float(2, 7) * (2 - scale)
        }
    }, [x, y, z])
    let rockRef = useRef<Group>(null)
    let foamRef = useFoam([scale * 1.25, scale * 1.25, scale * 1.25])

    useLayoutEffect(() => {
        if (!rockRef.current) {
            return
        }

        rockRef.current.position.y = y - 10
    }, [])

    useFrame((state, delta) => {
        if (!rockRef.current) {
            return
        }

        rockRef.current.position.y = damp(rockRef.current.position.y, position[1], damping, ndelta(delta))
    })

    return (
        <>
            <>
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
                    dispose={null}
                    geometry={cylinder}
                />
            </>
        </>
    )
}
