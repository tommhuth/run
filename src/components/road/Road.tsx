import { useStore } from "@data/store"
import { extendRoad, setState } from "@data/store/actions"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"

import { ROAD_FORWARD_EDGE } from "./const"
import BridgePart from "./parts/Bridge"
import ForestPart from "./parts/Forest"
import PickupPointPart from "./parts/PickupPoint"
import RocksPart from "./parts/Rocks"


export default function Road() {
    const parts = useStore(i => i.road)
    const i = useRef(0)

    useFrame(() => {
        const { road, player: { vehicle } } = useStore.getState()
        const forwardPart = road.at(-1)
        const forwardBuffer = ROAD_FORWARD_EDGE
        const backwardPart = road.at(0)
        const backwardBuffer = 10

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
            case "bridge":
                return <BridgePart {...i} key={i.id} />
            case "pickupPoint":
                return <PickupPointPart {...i} key={i.id} />
            case "forest":
                return <ForestPart {...i} key={i.id} />
            case "rocks":
                return <RocksPart {...i} key={i.id} />
        }
    })
}
