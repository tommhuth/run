
import React, { useEffect, useRef, useState } from "react" 
import {useThree} from "react-three-fiber" 
import {useStore} from "../data/store" 
import { useCannon } from "../data/cannon"
import random from "../data/random" 
import Config from "../Config"
import { Vec3 , Sphere} from "cannon"
import uuid from 'uuid'
import materials from "../shared/materials"

export default function Obstacle({ position, radius }) {
    let { ref, body } = useCannon({
        shape: new Sphere(radius),
        mass: 0,
        position
    })

    useEffect(() => {
        let axis = new Vec3(...random.pick([
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ]))
        let angle = random.real(0, Math.PI * 2)

        body.quaternion.setFromAxisAngle(axis, angle)
    }, [])

    return (
        <mesh ref={ref} material={materials.obstacle}>  
            <sphereBufferGeometry attach="geometry" args={[radius, 8, 8]} />
        </mesh>
    )
}