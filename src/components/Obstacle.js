
import React, { useEffect } from "react"
import { useCannon } from "../data/cannon"
import { Vec3, Box, Sphere } from "cannon" 
import { SphereGeometry } from "three"

function Obstacle({ mergeGeometry, radius, position, block }) {
    useCannon({
        shape: new Sphere(radius),
        mass: 0,
        position: [
            position[0],
            block.y,
            position[2] + block.start + block.depth / 2
        ]
    })

    useEffect(() => {
        let sphere = new SphereGeometry(radius)

        sphere.translate(...position)

        mergeGeometry(sphere) 
    }, [])

    return (
        null
    )
}

export default React.memo(Obstacle)