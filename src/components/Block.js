
import React from "react" 
import ObstaclesBlock from "./blocks/ObstaclesBlock" 
import BlockType from "../data/const/BlockType"
import NarrowBlock from "./blocks/NarrowBlock" 
import CommonBlock from "./blocks/CommonBlock" 

function Block(props) {
    switch (props.type) {
        case BlockType.START:
        case BlockType.PLAIN:
            return <CommonBlock {...props} />
        case BlockType.OBSTACLES:
            return (
                <CommonBlock {...props}>
                    <ObstaclesBlock  />
                </CommonBlock>
            )
        case BlockType.NARROW:
            return <NarrowBlock {...props} />
    }
}

export default React.memo(Block)