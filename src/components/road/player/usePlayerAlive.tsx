import Config from "@data/Config"
import { useLowerPriorityFrame } from "@data/hooks/utils"
import { useStore } from "@data/store/store"
import { extractRotation } from "@data/utils"
import { Tuple3 } from "@src/types/global"
import { Dispatch, SetStateAction } from "react"

import { ROAD_GAME_OVER_X_EDGE } from "../const"

const MAX_ROTATION = Math.PI * .5 * .85

export default function usePlayerAlive(setPosition: Dispatch<SetStateAction<Tuple3>>) {
    useLowerPriorityFrame(() => {
        const { player: { vehicle }, traffic } = useStore.getState()
        const disabled = false

        if (!vehicle || Config.DEBUG || disabled) {
            return
        }

        const rotation = Math.abs(extractRotation(vehicle.chassisBody.quaternion).y)
        const offside = Math.abs(vehicle.chassisBody.position.x)

        if (offside > ROAD_GAME_OVER_X_EDGE || rotation > MAX_ROTATION) {
            const forwards = traffic.filter(i => i.direction === 1)
                .map(i => i.position[2])

            setPosition([-2, 2, Math.min(...forwards) - 6])
        }
    }, 10)
}
