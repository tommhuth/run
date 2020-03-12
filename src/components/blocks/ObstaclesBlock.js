import React, { useState } from "react" 
import random from "../../data/random"
import Obstacle from "../Obstacle" 
import { Vector3 } from "three"

export default function ObstaclesBlock({
    depth,
    start,
    active,
    y
}) { 
    let [obstacles] = useState(() => {
        let count = depth * random.pick([.1, .15, .075])
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

                if (distance < (obstacle.radius + insertable.radius) + 2) {
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

    return (
        <> 
            {obstacles.map((props, index) => <Obstacle active={active} key={index} {...props} />)}
        </>
    )
}