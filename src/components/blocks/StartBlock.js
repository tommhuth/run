
import React from "react" 
import Coin from "../actors/Coin"

function StartBlock(props) {  
    return (
        <>
            <Coin
                x={0}
                y={props.y}
                z={props.start + props.depth - 30}
                blockDead={props.dead}
            />
            <Coin
                x={0}
                y={props.y}
                z={props.start + props.depth - 25}
                index={1}
                blockDead={props.dead}
            />
            <Coin
                x={0}
                y={props.y}
                z={props.start + props.depth - 20}
                index={2}
                blockDead={props.dead}
            />
        </>
    )
}

export default React.memo(StartBlock)