
import React, { useEffect, useState } from "react"
import { useCannon } from "../data/cannon"
import materials from "../shared/materials"
import { Vec3, Box, Sphere } from "cannon"
import animate from "../data/animate"
import Config from "../Config"
import random from "../data/random"

function Obstacle({ dead, radius, position, block }) {
    let { ref, body } = useCannon({
        shape: new Sphere(radius),
        mass: 0,
        position: [
            position[0],
            block.y - 20,
            position[2] + block.start + block.depth / 2
        ]
    })
    let [material] = useState(() => {
        return materials.ground
    })

    useEffect(() => {
        let mass = random.integer(100, 400)

        ref.current.visible = false 

        return animate({
            from: { y: body.position.y },
            to: { y: block.y }, 
            duration: mass + 200,
            delay: 1200 + mass,
            start() {
                ref.current.visible = true 
            },
            render({ y }) {
                body.position.y = y
            },
        })
    }, [])

    useEffect(() => {
        if (dead) {  
            return animate({
                from: { y: body.position.y },
                to: { y: body.position.y - 100 },
                easing: "easeInCubic",
                duration: 600,
                render({ y }) {
                    body.position.y = y
                }
            })
        }
    }, [dead])

    return (
        <mesh ref={ref} material={material} castShadow receiveShadow>
            <sphereBufferGeometry args={[radius, 8, 8]} attach={"geometry"} />
        </mesh>
    )
}

export default React.memo(Obstacle)