import React, { useState, useCallback } from "react"
import Coin from "./Coin"
import uuid from "uuid"
import random from "@huth/random"

export default function CoinLine({ x = 0, y, z, depth, count: defaultCount }) {
    let [coins, setCoins] = useState(() => {
        let result = []
        let gap = Math.min(5, depth * .2)
        let count = defaultCount ? defaultCount : random.integer(1, 4)

        for (let i = 0; i < count; i++) {
            result.push({
                id: uuid.v4(),
                x,
                y,
                z: z + i * gap - ((count - 1) / 2 * gap)
            })
        }

        return result
    })
    let remove = useCallback((id)=> {
        setCoins(prev => prev.filter(j => j.id !== id)) 
    }, [])

    return (
        <>
            {coins.map(i => {
                return (
                    <Coin
                        remove={remove}
                        key={i.id}
                        {...i}
                    />
                )
            })}
        </>
    )
}