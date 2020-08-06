import React, { useState } from "react" 
import random from "../../data/random"
import Enemy from "../Enemy" 

export default function EnemiesBlock({
    depth,
    start,
    active,
    y
}) { 
    let [enemies] = useState(() => {
        let result = []
        let count = Math.min(Math.max(1, random.integer(1, depth * .15)), 4)

        for (let i = 0; i < count; i++) {
            let border = 50
            let radius = random.integer(2, 6)
            let x = random.pick([border, -border])
            let velocityX = random.integer(10, 16) * -x / border
            let z = start + random.integer(2, depth - 2)

            result.push({
                x,
                y: y + radius + 10,
                radius,
                z,
                velocityX,
                triggerZ: z - random.integer(15, 22)
            })
        }

        return result
    }) 

    return (
        <> 
            {enemies.map((props, index) => <Enemy active={active} key={index} {...props} />)}
        </>
    )
}