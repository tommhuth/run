import React, { useMemo } from "react"
import { Cylinder, Quaternion, Vec3 } from "cannon"
import { useCannon } from "../data/cannon"
import materials from "../data/materials"

export default function SimulatedCylinder({
    position,
    mass = 0,
    radius = 1,
    height = 1,
    segments = 8,
    rotation = [0, 0, 0]
}) {
    let cannonConfig = useMemo(() => ({
        mass,
        position,
        shape: new Cylinder(radius, radius, height, segments),
        cb: (body) => {
            let quat = new Quaternion()
            let translation = new Vec3(0, 0, 0)

            quat.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2)
            body.shapes[0].transformAllPoints(translation, quat)
            body.quaternion.setFromEuler(0, Math.random()*4, 0)
        }
    }), [])
    let ref = useCannon(cannonConfig)

    return (
        <mesh
            ref={ref}
            position={position}
            material={materials.red}
        >
            <cylinderBufferGeometry attach="geometry" args={[radius, radius, height, segments]} />
        </mesh>
    )
}