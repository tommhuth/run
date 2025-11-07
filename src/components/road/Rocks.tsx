import { useTransitionedState } from "@data/utils"
import random from "@huth/random"
import { Tuple3 } from "@src/types/global"
import { useCallback } from "react"

import { ROAD_EDGE_X, ROAD_FORWARD_EDGE } from "./Road"
import Rock from "./Rock"

export default function Rocks({ count = 8 }) {
    const [rocks, setRocks] = useTransitionedState(() => {
        return Array.from({ length: count }).fill(null).map(() => {
            const radius = random.pick(1, 1.5, 2.5, 4, 1.85, 2, 3, 2.4)

            return {
                id: random.id(),
                position: [
                    random.integer(ROAD_EDGE_X + radius, ROAD_EDGE_X + 9) * random.pick(-1, 1),
                    random.float(0, .35),
                    random.integer(-1, ROAD_FORWARD_EDGE * .5)
                ] as Tuple3,
                rotation: [random.pick(Math.PI, 0), random.float(0, Math.PI * 2), random.pick(Math.PI, 0)],
                radius,
                scaly: random.float(.85, 1.25),
                active: false
            }
        })
    })
    const update = useCallback((data, id) => {
        setRocks(rocks => [
            ...rocks.filter(j => j.id !== id),
            {
                ...rocks.find(j => j.id === id),
                ...data
            }
        ])
    }, [])

    return rocks.map((i) => {
        return (
            <Rock
                {...i}
                key={i.id}
                update={update}
            />
        )
    })
}
