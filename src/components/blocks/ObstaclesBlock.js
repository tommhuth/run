
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react"
import { useThree } from "react-three-fiber"
import { useStore } from "../../data/store"
import { useCannon } from "../../data/cannon"
import random from "../../data/random"
import Obstacle from "../Obstacle"
import Config from "../../Config"
import uuid from "uuid"
import { Vector3 } from "three"


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

function ObstaclesBlock(props) {
    let addEnemy = useStore(i => i.addEnemy)
    let obstacles = useMemo(() => {
        let obstacleCount = random.integer(1, 3)
        let result = []
        let radii = [2.5, 2, 3, 4, 5]
        let getPosition = (radius) => {
            let l = random.integer(-(Config.BLOCK_WIDTH / 2) + radius, -radius)
            let r = random.integer(radius, Config.BLOCK_WIDTH / 2 - radius)

            return [
                random.bool() ? l : r,
                Config.BLOCK_HEIGHT / 2,
                random.integer((-props.depth / 2) + radius + 1, props.depth / 2 - radius)
            ]
        }

        outer:
        for (let i = 0; i < obstacleCount; i++) {
            let radius = random.pick(radii)
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
        let id = setTimeout(() => {
            let count = random.integer(0, 2)

            for (let i = 0; i < count; i++) {
                addEnemy([
                    random.integer(-Config.BLOCK_WIDTH / 2, Config.BLOCK_WIDTH / 2),
                    props.y,
                    props.end
                ])
            }
        }, 1200)

        return () => clearTimeout(id)
    }, [])

    return (
        <>
            {obstacles.map(i => (
                <Obstacle
                    {...i}
                    mergeGeometry={props.mergeGeometry}
                    key={i.id}
                    block={props}
                />
            ))}
        </>
    )
}

export default React.memo(ObstaclesBlock)