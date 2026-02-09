import { useStore } from "@data/store"
import { extendRoad, setState } from "@data/store/actions"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"

import PlainPart from "./parts/Plain"

const [, height] = [9, .75, 500]

export const ROAD_HEIGHT = height
export const ROAD_CENTER_X = 1.5
export const ROAD_EDGE_X = ROAD_CENTER_X + 2.25
export const ROAD_FORWARD_EDGE = 50
export const ROAD_GAME_OVER_X_EDGE = 16
export const FOG_DISTANCE = 40


export default function Road() {
    const parts = useStore(i => i.road)
    const i = useRef(0)

    useFrame(() => {
        const { road, player: { vehicle } } = useStore.getState()
        const forwardPart = road.at(-1)
        const forwardBuffer = ROAD_FORWARD_EDGE
        const backwardPart = road.at(0)
        const backwardBuffer = 5

        i.current++

        if (!vehicle || !forwardPart || !backwardPart || i.current % 10 !== 0) {
            return
        }

        const player = vehicle.chassisBody

        if (backwardPart.position[2] + backwardPart.depth < player.position.z - backwardBuffer) {
            setState({ road: road.slice(1) })
        } else if (player.position.z + forwardBuffer > forwardPart.position[2] + forwardPart.depth) {
            extendRoad(forwardPart)
        }
    })

    return parts.map(i => {
        switch (i.type) {
            case "plain":
                return <PlainPart {...i} key={i.id} />
        }
    })
}
