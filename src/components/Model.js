
import React, { useState, useEffect } from "react"
import externalMeshes from "../utils/meshes"
import { useCannon } from "../utils/cannon"
import random from "../utils/random"
import { meshToShape, ShapeType } from "../addons/meshToShape"

export default function Model({
    mass = 0,
    position = [0, 4, 2],
    type,
    scale = [1, 1, 1],
    rotation: [rotateX, rotateY, rotateZ] = [0, 0, 0],
    flippable = true
}) {
    let [meshes, setMeshes] = useState(null)
    let [flipX] = useState(random.pick([-1, 1]))
    let [flipZ] = useState(random.pick([-1, 1]))
    let [flipY] = useState(random.pick([-1, 1]))

    useEffect(() => {
        externalMeshes.then(meshes => setMeshes(meshes))
    }, [meshes])

    const ref = useCannon(
        { mass },
        body => {
            if (meshes && ref) {
                let shape = meshToShape(ref.current, { type: ShapeType.BOX })

                body.addShape(shape)
                body.position.set(...position)
                body.quaternion.setFromEuler(rotateX, rotateY, rotateZ)
            }
        },
        [meshes, ref]
    )

    if (!meshes) {
        return null
    }

    return (
        <mesh
            ref={ref}
            castShadow
            receiveShadow
            geometry={meshes[type]}
            position={position}
            scale={[
                scale[0] * (flippable ? flipX : 1),
                scale[1] * (flippable ? flipY : 1),
                scale[2] * (flippable ? flipZ : 1)
            ]}
        >
            <meshPhongMaterial
                dithering
                color={0x666666}
                emissive={0xcccccc}
                attach="material"
            />
        </mesh>
    )
}
