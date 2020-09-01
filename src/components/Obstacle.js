import React, { useEffect } from "react"
import { Vec3, Sphere } from "cannon"
import { useCannon } from "../data/cannon"
import random from "@huth/random"
import { material, geometry } from "../data/resources"

export default React.memo(({
    radius = 4,
    x,
    y,
    active = false,
    z
}) => {
    let { ref, body } = useCannon({
        shape: new Sphere(radius),
        collisionFilterGroup: 1,
        collisionFilterMask: 1 | 2 | 4,
        active,
        position: [x, y, z]
    })

    useEffect(() => {
        let axis = new Vec3(...random.pick(
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ))
        let angle = random.float(0, Math.PI * 2)

        body.quaternion.setFromAxisAngle(axis, angle)
    }, [body])

    return (
        <mesh
            scale={[radius, radius, radius]}
            geometry={geometry.sphere}
            ref={ref}
            material={material.blue} 
        />
    )
})