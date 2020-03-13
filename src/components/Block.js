import React, { useEffect, useState } from "react"
import { api } from "../data/store"
import BlockType from "../data/const/BlockType"
import ObstaclesBlock from "./blocks/ObstaclesBlock"
import PlainBlock from "./blocks/PlainBlock"
import EnemiesBlock from "./blocks/EnemiesBlock"
import { Box, Vec3 } from "cannon"
import { useCannon } from "../data/cannon"
import { material } from "../data/resources"

function renderBlockType(props, active) {
    switch (props.type) {
        case BlockType.OBSTACLES:
            return <ObstaclesBlock {...props} active={active} />
        case BlockType.PLAIN:
            return <PlainBlock {...props} active={active} />
        case BlockType.ENEMIES:
            return <EnemiesBlock {...props} active={active} />
        default:
            throw new Error(`Unknown Block type ${props.type}`)
    }
}

export default function Block(props) {
    let [active, setActive] = useState(props.active)
    let position = [0, props.y - 5, props.start + props.depth / 2]
    let { ref } = useCannon({
        shape: new Box(new Vec3(100, 5, props.depth / 2)),
        active,
        collisionFilterGroup: 6,
        collisionFilterMask: 1 | 2 | 4,
        position
    })

    useEffect(() => {
        return api.subscribe(({ z }) => {
            if (z > props.start - 20 && z < props.end + 20) {
                if (!active) {
                    setActive(true)
                    console.log("active")
                }
            } else {
                if (active) {
                    setActive(false)
                    console.log("unactive")
                }
            }
        }, state => state.data.position)
    }, [active])

    return (
        <>
            {renderBlockType(props, active)}

            <mesh position={position} material={active ? material.blue : material.red} ref={ref}>
                <boxBufferGeometry attach="geometry" args={[200, 10, props.depth]} />
            </mesh>
        </>
    )
}