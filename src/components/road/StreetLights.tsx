import { useTransitionedState } from "@data/utils"
import random from "@huth/random"
import { Tuple3 } from "@src/types/global"

import { ROAD_EDGE_X, ROAD_HEIGHT } from "./Road"
import StreetLightPair from "./StreetLightPair"
import { useCallback } from "react"

export const LIGHT_INTERVAL = 25

export default function StreetLights({ count = 4 }) {
    const [lights, setLights] = useTransitionedState(() => {
        return Array.from({ length: count }).fill(null).map((i, index) => {
            const x = ROAD_EDGE_X
            const z = index * LIGHT_INTERVAL
            const y = ROAD_HEIGHT - .25

            return {
                id: random.id(),
                position: [x, y, z] as Tuple3
            }
        })
    })
    const update = useCallback((data, id) => {
        setLights([
            ...lights.filter(j => j.id !== id),
            {
                ...lights.find(j => j.id === id),
                ...data
            }
        ])
    }, [])

    return lights.map((i) => {
        return (
            <StreetLightPair
                {...i}
                key={i.id}
                lights={lights}
                update={update}
            />
        )
    })
}
