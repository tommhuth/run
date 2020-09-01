import React, { useState } from "react"
import CoinLine from "../CoinLine"
import random from "@huth/random"

export default function PlainBlock({
    depth,
    start,
    y
}) {
    let [coinX] = useState(() => random.integer(-4, 4))

    return (
        <>
            <CoinLine
                depth={depth}
                x={coinX}
                z={start + depth / 2}
                y={y}
            />
        </>
    )
}