import { useLowerPriorityFrame } from "@data/hooks/utils"
import { setState } from "@data/store/actions/actions"
import { extendRoad } from "@data/store/actions/road"
import { useStore } from "@data/store/store"

import { ROAD_FORWARD_EDGE } from "./const"
import BridgePart from "./parts/Bridge"
import ForestPart from "./parts/Forest"
import PickupPointPart from "./parts/PickupPoint"
import RocksPart from "./parts/Rocks"


export default function Road() {
    const parts = useStore(i => i.road)

    useLowerPriorityFrame(() => {
        const { road, player: { vehicle } } = useStore.getState()
        const forwardPart = road.at(-1)
        const forwardBuffer = ROAD_FORWARD_EDGE
        const backwardPart = road.at(0)
        const backwardBuffer = 10

        if (!vehicle || !forwardPart || !backwardPart) {
            return
        }

        const player = vehicle.chassisBody

        if (backwardPart.position[2] + backwardPart.depth < player.position.z - backwardBuffer) {
            setState({ road: road.slice(1) })
        } else if (player.position.z + forwardBuffer > forwardPart.position[2] + forwardPart.depth) {
            extendRoad(forwardPart)
        }
    }, 10)

    return (
        <>
            {parts.map(i => {
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
            })}
        </>
    )
}
