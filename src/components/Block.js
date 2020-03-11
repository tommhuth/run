import React, { useEffect, useState } from "react"
import { api } from "../data/store"
import { Box, Vec3 } from "cannon"
import { useCannon } from "../data/cannon"
import random from "../data/random"
import Enemy from "./Enemy"
import Obstacle from "./Obstacle"
import { material } from "../data/resources"
import { Vector3 } from "three"

export default function Block({
    depth,
    start,
    end,
    empty = false,
    active: defaultActive = false,
    y
}) {
    let [active, setActive] = useState(defaultActive)
    let { ref } = useCannon({
        shape: new Box(new Vec3(100, 5, depth / 2)),
        active,
        collisionFilterGroup: 6,
        collisionFilterMask: 1 | 2 | 4,
        position: [0, y - 5, start + depth / 2]
    })
    let [obstacles] = useState(() => {
        let count = !empty ? depth * random.pick([.1, .15, .075]) : 0
        let result = []
        let getObstacle = () => {
            let radius = random.pick([8, 9, 6, 7, 5, 4, 3, 14])
            let border = 30 // outer border

            return {
                radius,
                z: random.real(start + radius, start + depth - radius),
                y: y,
                x: random.integer(-border + radius, border - radius)
            }
        }
        let isTooClose = (insertable, obstacles) => {
            for (let obstacle of obstacles) {
                let distance = new Vector3(insertable.x, insertable.y, insertable.z)
                    .distanceTo(new Vector3(obstacle.x, obstacle.y, obstacle.z))

                if (distance < (obstacle.radius + insertable.radius) +2) {
                    return true
                }
            }

            return false
        }

        for (let i = 0; i < count; i++) {
            let obstacle = getObstacle()
            let attempts = 0

            while (isTooClose(obstacle, result) && attempts <= 8) {
                obstacle = getObstacle()
                attempts++
            }

            if (attempts >= 8) { 
                // stop trying, and use whatever we got working
                break
            } else {
                result.push(obstacle)
            }
        }

        return result
    })
    let [enemies] = useState(() => {
        let result = []
        let count = obstacles.length === 0 && !empty ? random.integer(1, depth * .25) : 0
        let maxVelocity = 20

        for (let i = 0; i < count; i++) {
            let border = 40 + random.integer(0, 5)
            let radius = random.integer(1, 5)
            let x = random.pick([border, -border])
            let velocityX = (1 - (radius / (1 + 5))) * maxVelocity * -x / border
            let z = start + random.integer(2, depth - 2)

            result.push({
                x,
                y: y + 2,
                radius,
                z,
                velocityX,
                triggerZ: z - Math.abs(velocityX * 1.5)
            })
        }

        return result
    })

    useEffect(() => {
        return api.subscribe(({ z }) => {
            if (z > start - 20 && z < end + 20) {
                if (!active) {
                    setActive(true)
                }
            } else {
                if (active) {
                    setActive(false)
                }
            }
        }, state => state.data.position)
    }, [active])

    return (
        <>
            <mesh material={active ? material.blue : material.red} ref={ref}>
                <boxBufferGeometry attach="geometry" args={[200, 10, depth]} />
            </mesh>

            {obstacles.map((props, index) => <Obstacle active={active} key={index} {...props} />)}
            {false && enemies.map((props, index) => <Enemy active={active} key={index} {...props} />)}
        </>
    )
}