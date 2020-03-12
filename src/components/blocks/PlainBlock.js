import React from "react" 
import CoinLine from "../CoinLine"

export default function PlainBlock({
    depth,
    start, 
    y
}) { 
    return (
        <>
            <CoinLine
                depth={depth}
                z={start + depth / 2}
                y={y}
            /> 
        </>
    )
}