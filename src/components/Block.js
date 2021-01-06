import ObstaclesBlock from "./blocks/ObstaclesBlock"
import BlockType from "../data/const/BlockType"
import NarrowBlock from "./blocks/NarrowBlock"
import CommonBlock from "./CommonBlock"
import React from "react"

function Block(props) {
    switch (props.type) {
        case BlockType.PLAIN:
            return <CommonBlock {...props} />
        case BlockType.OBSTACLES:
            return (
                <CommonBlock {...props}>
                    <ObstaclesBlock />
                </CommonBlock>
            )
        case BlockType.NARROW:
            return <NarrowBlock {...props} />
    }
}

export default React.memo(Block)