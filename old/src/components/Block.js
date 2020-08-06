import React, { useEffect, useState } from "react"
import { api } from "../data/store"
import BlockType from "../data/const/BlockType"
import ObstaclesBlock from "./blocks/ObstaclesBlock"
import PlainBlock from "./blocks/PlainBlock"
import EnemiesBlock from "./blocks/EnemiesBlock"
import StartBlock from "./blocks/StartBlock"
import { Box, Vec3 } from "cannon"
import { useBox } from "use-cannon"
import { useCannon } from "../data/cannon"
import { material } from "../data/resources"
import { useFrame } from "react-three-fiber"

function renderBlockType(props, active) {
    switch (props.type) {
        case BlockType.OBSTACLES:
            return <ObstaclesBlock {...props} active={active} />
        case BlockType.PLAIN:
            return <PlainBlock {...props} active={active} />
        case BlockType.ENEMIES:
            return <EnemiesBlock {...props} active={active} />
        case BlockType.START:
            return <StartBlock {...props} active={active} />
        default:
            throw new Error(`Unknown Block type ${props.type}`)
    }
}

function Block(props) {
    let position = [0, props.y - 5, props.start + props.depth / 2]
    let [ref] = useBox(() => ({
        args: [20, 10, props.depth],
        mass: 0,
        position, 
    }))

    useEffect(() => {
        console.log("NEW block", position, props.id )
    }, []) 

    return (
        <>
            <mesh 
                material={material.blue}
                ref={ref}
            >
                <boxBufferGeometry attach="geometry" args={[20, 10, props.depth]} />
            </mesh>
        </>
    )
}

// {renderBlockType(props, active)}

export default React.memo(Block)