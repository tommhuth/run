
import React, { useEffect, useState, useMemo } from "react"
import { useStore } from "../../data/store"
import random from "../../data/random"
import Obstacle from "../Obstacle"
import Config from "../../Config"
import uuid from "uuid"
import { Vector3 } from "three"
import Coin from "../actors/Coin"
import Only from "../Only"
import DistanceMarker from "../DistanceMarker"

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
    let [hasCoin] = useState(() => random.boolean(.35))
    let addEnemy = useStore(i => i.addEnemy)
    let obstacles = useMemo(() => {
        let obstacleCount = random.integer(1, 3)
        let result = []
        let radii = [2.5, 2, 3, 4, 5]
        let getPosition = (radius) => {
            let l = random.integer(-(Config.BLOCK_WIDTH / 2) + radius, -radius)
            let r = random.integer(radius, Config.BLOCK_WIDTH / 2 - radius)

            return [
                random.boolean() ? l : r,
                Config.BLOCK_HEIGHT / 2,
                random.integer((-props.depth / 2) + radius + 1, props.depth / 2 - radius)
            ]
        }

        outer:
        for (let i = 0; i < obstacleCount; i++) {
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
        let id = setTimeout(() => {
            let count = random.integer(0, 2)

            for (let i = 0; i < count; i++) {
                addEnemy([
                    random.integer(-Config.BLOCK_WIDTH / 2, Config.BLOCK_WIDTH / 2),
                    props.y,
                    props.end
                ])
            }
        }, Config.BLOCK_IN_DURATION)

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
                    dead={props.dead}
                />
            ))}
            <Only if={hasCoin}>
                <Coin
                    x={0}
                    y={props.y}
                    z={props.start + props.depth / 2}
                    dead={props.dead}
                />
            </Only>
            <Only if={props.distance}>
                <DistanceMarker
                    y={props.y}
                    z={props.start + props.depth / 2}
                    distance={props.distance}
                    dead={props.dead}
                />
            </Only>
        </>
    )
}

export default React.memo(ObstaclesBlock)

