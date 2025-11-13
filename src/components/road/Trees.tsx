import { useTransitionedState } from "@data/utils"
import random from "@huth/random"
import { Tuple3 } from "@src/types/global"

import { ROAD_EDGE_X } from "./Road"
import Tree from "./Tree"
import { useCallback } from "react"

const interval = 90

export function Trees({ count = 18 }) {
    const [trees, setTrees] = useTransitionedState(() => {
        return Array.from({ length: count }).fill(null).map(() => {
            const x = random.integer(ROAD_EDGE_X + 3, ROAD_EDGE_X + 10)
            const z = random.integer(-5, interval)
            const y = 0

            return {
                id: random.id(),
                position: [x * random.pick(-1, 1), y, z] as Tuple3,
                type: random.pick(0, 1, 2, 3, 4, 5),
                scale: random.float(1.25, 2),
                active: false,
                rotation: [0, random.float(0, Math.PI * 2), 0]
            }
        })
    })
    const update = useCallback((data, id) => {
        setTrees(trees => [
            ...trees.filter(j => j.id !== id),
            {
                ...trees.find(j => j.id === id),
                ...data
            }
        ])
    }, [])

    return trees.map((i) => {
        return (
            <Tree
                {...i}
                key={i.id}
                update={update}
            />
        )
    })
}
