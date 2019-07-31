
import React, { useState, useEffect } from "react"
import externalMeshes from "../utils/meshes"
import { useCannon } from "../utils/cannon"
import { meshToShape, ShapeType } from "../addons/meshToShape"


export default function Model({ mass = 0, position = [0, 4, 2], type, scale=[1,1,1] }) {
    let [meshes, setMeshes] = useState(null)

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
            scale={scale}
            geometry={meshes && meshes[type]}
            position={position}
        >
            <meshPhongMaterial dithering color={0xcccccc} attach="material" />
        </mesh>
    )
}
