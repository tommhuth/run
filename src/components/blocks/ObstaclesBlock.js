
import React, { useEffect, useRef, useState, useMemo } from "react"
import { useStore } from "../../data/store"
import random from "../../data/random"
import Obstacle from "../Obstacle"
import Config from "../../Config"
import materials from "../../shared/materials"
import uuid from "uuid"
import { Vector3 } from "three"
import Coin from "../actors/Coin"
import Only from "../Only"
import { TextGeometry, Font } from "three"
import oswaldFont from "../../../assets/fonts/oswald.json"
import animate from "../../data/animate"

let vec1 = new Vector3()
let vec2 = new Vector3()
let font = new Font(oswaldFont)

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


function Text({
    x = 0,
    y = 0,
    z = 0,
    text,
    size = 1,
    index = 0,
    blockDead,
    ...rest
}) {
    let ref = useRef()

    useEffect(() => {
        if (blockDead) {
            return animate({
                from: { x: x + 10 },
                to: { x: x - 50 },
                duration: Config.BLOCK_OUT_DURATION,
                easing: "easeInQuart",
                render({ x }) {
                    ref.current.position.x = x
                }
            })
        }
    }, [blockDead, x])

    useEffect(() => {
        ref.current.position.set(x + 100, y, z)

        return animate({
            from: { x: x + 100 },
            to: { x: x + 10 },
            duration: 1600,
            delay: index * 250 + 1000,
            easing: "easeOutCubic",
            render({ x }) {
                ref.current.position.x = x
            }
        })
    }, [x, y, z, index])

    return (
        <mesh
            scale={[-1, 1, 1]}
            ref={ref}
            material={materials.player}
            {...rest}
        >
            <textGeometry
                attach="geometry"
                args={[
                    text,
                    {
                        size,
                        font,
                        height: .75,
                        curveSegments: 3,
                        bevelEnabled: false
                    }
                ]}
            />
        </mesh>
    )
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
                    blockDead={props.dead}
                />
            </Only>
            <Only if={props.distanceMarker}>
                <Text
                    text={props.distanceMarker + ""}
                    size={9}
                    x={1}
                    y={props.y + 15}
                    index={0}
                    z={props.start + props.depth / 2}
                    blockDead={props.dead}
                />
                <Text
                    text={"METERS"}
                    size={4}
                    x={0}
                    index={1}
                    y={props.y + 10}
                    z={props.start + props.depth / 2}
                    blockDead={props.dead}
                />
            </Only>
        </>
    )
}

export default React.memo(ObstaclesBlock)

