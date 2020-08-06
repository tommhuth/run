
import React, { useEffect, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "react-three-fiber"
import { useCannon } from "../data/cannon"
import { Sphere } from "cannon"
import { useStore, api } from "../data/store"
import materials from "../shared/materials"

function Enemy({ position, radius, speed, id }) {
    let removeEnemy = useStore(i => i.removeEnemy)
    let { ref, body } = useCannon({
        mass: radius * radius,
        shape: new Sphere(radius),
        position
    })
    let playerZ = useRef(0)

    useEffect(() => {
        return api.subscribe(z => playerZ.current = z, state => state.position.z)
    })

    useFrame(() => {
        body.velocity.z = speed

        if (body.position.y < -100) {
            removeEnemy(id)
        }
    })

    return (
        <mesh ref={ref} material={materials.enemy}> 
            <sphereBufferGeometry attach="geometry" args={[radius, 12, 6]} />
        </mesh>
    )
}

export default React.memo(Enemy)