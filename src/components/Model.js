
import React, { useState, useEffect } from "react"
import externalMeshes from "../utils/meshes"
import { useCannon } from "../utils/cannon"
import random from "../utils/random"
import { meshToShape, ShapeType } from "../../assets/addons/meshToShape"
import { Sphere } from "cannon"

export default function Model({
    mass = 0,
    position = [0, 4, 2],
    type,
    scale = [1, 1, 1],
    rotation: [rotateX, rotateY, rotateZ] = [0, 0, 0],
    shapeType = ShapeType.BOX,
    flippable = true
}) {
    let [meshes, setMeshes] = useState(null)
    let [flipX] = useState(random.pick([-1, 1]))
    let [flipZ] = useState(random.pick([-1, 1]))
    let [flipY] = useState(random.pick([-1, 1]))
    let ref
 
    useEffect(() => {
        externalMeshes.then(meshes => setMeshes(meshes))
    }, [meshes])

    ref = useCannon(
        { mass },
        body => {
            if (meshes && ref) {
                let shape

                switch (type) {
                    case "rock1":
                    case "rock2":
                        shape = new Sphere(scale[0] )
                        break
                    default:
                        shape = meshToShape(ref.current, { type: shapeType })
                        break
                }

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
                //emissive={0xcccccc}
                attach="material"
            />
        </mesh>
    )
}
