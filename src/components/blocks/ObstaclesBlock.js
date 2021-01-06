import React, { useEffect, useState, useMemo } from "react"
import { useStore } from "../../data/store"
import random from "@huth/random"
import Obstacle from "../Obstacle"
import Config from "../../Config"
import uuid from "uuid"
import { Vector3 } from "three"
import Coin from "../actors/Coin"
import Only from "../Only" 

let vec1 = new Vector3()
let vec2 = new Vector3()

let isTooClose = (position, radius, obstacles) => {
    for (let obstacle of obstacles) {
        let distance = vec1.set(...position)
            .distanceTo(vec2.set(...obstacle.position))

        if (distance < obstacle.radius + radius) {
            return true
        }
    }

    return false
}

function ObstaclesBlock({
    dead,
    start,
    end,
    depth, 
    width,
    initial = false,
    y,
    hasEnemies = true,
    coinLikelihood = .35,
    obstacleCount 
}) {
    let [hasCoin] = useState(() => random.boolean(coinLikelihood))
    let addEnemy = useStore(i => i.addEnemy)
    let obstacles = useMemo(() => {
        let count = typeof obstacleCount === "number" ? obstacleCount : random.integer(1, 3)
        let result = []
        let radii = [2.5, 2, 3, 4, 5]
        let getPosition = (radius) => {
            let l = random.integer(-(width/ 2) + radius, -radius)
            let r = random.integer(radius, width / 2 - radius)

            return [
                random.boolean() ? l : r,
                Config.BLOCK_HEIGHT / 2,
                random.integer((-depth / 2) + radius + 1, depth / 2 - radius)
            ]
        }

        outer:
        for (let i = 0; i < count; i++) {
            let radius = random.pick(...radii)
            let position = getPosition(radius)
            let attempts = 0

            radii = radii.filter(i => i !== radius)

            while (isTooClose(position, radius, result)) {
                position = getPosition(radius)
                attempts++

                if (attempts > 10) {
                    break outer
                }
            }

            result.push({
                id: uuid.v4(),
                radius,
                position
            })
        }

        return result
    }, [])

    useEffect(() => {
        if (hasEnemies) {
            let id = setTimeout(() => {
                let count = random.integer(0, 1)

                for (let i = 0; i < count; i++) {
                    addEnemy([
                        random.integer(-Config.BLOCK_WIDTH / 2, Config.BLOCK_WIDTH / 2),
                        y + 15,
                        end
                    ])
                }
            }, Config.BLOCK_IN_DURATION)

            return () => clearTimeout(id)
        }

    }, [hasEnemies, y])

    return (
        <>
            {obstacles.map(i => (
                <Obstacle
                    {...i}
                    key={i.id}
                    block={{ start, end, depth, width, y, initial }}
                    dead={dead}
                />
            ))}
            <Only if={hasCoin}>
                <Coin
                    x={0}
                    y={y}
                    z={start + depth / 2}
                    dead={dead}
                />
            </Only> 
        </>
    )
}

export default React.memo(ObstaclesBlock)