import React, { useState } from "react"
import Coin from "./Coin"
import uuid from "uuid"
import random from "../data/random"
import { useStore } from "../data/store"

export default function CoinLine({ x = 0, y, z, depth, count: defaultCount }) {
    let actions = useStore(state => state.actions)
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

    return (
        <>
            {coins.map(i => {
                return (
                    <Coin
                        remove={() => {
                            actions.extendTime()
                            setCoins(prev => prev.filter(j => j.id !== i.id))
                        }}
                        key={i.id}
                        {...i}
                    />
                )
            })}
        </>
    )
}