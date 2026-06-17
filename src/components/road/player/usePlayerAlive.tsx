import { useLowerPriorityFrame } from "@data/hooks/utils"
import { useStore } from "@data/store/store"
import { extractRotation } from "@data/utils"
import { Tuple3 } from "@src/types/global"
import { Vec3 } from "cannon-es"
import { Dispatch, SetStateAction } from "react"

import { ROAD_GAME_OVER_X_EDGE } from "../const"

const MAX_ROTATION = Math.PI * .5 * .875
const MAX_UPRIGHT_DIFFERENCE = .5

const _up = new Vec3(0, 1, 0)
const _orientation = new Vec3()

export default function usePlayerAlive(setPosition: Dispatch<SetStateAction<Tuple3>>) {
    useLowerPriorityFrame(() => {
        const { player: { vehicle }, traffic, debug } = useStore.getState()

        if (!vehicle || debug.godMode) {
            return
        }

        const rotation = Math.abs(extractRotation(vehicle.chassisBody.quaternion).y)
        const offside = Math.abs(vehicle.chassisBody.position.x)
        const playerOrientation = vehicle.chassisBody.quaternion
            .vmult(_up, _orientation)
            .dot(_up)

        if (
            offside > ROAD_GAME_OVER_X_EDGE ||
            rotation > MAX_ROTATION ||
            playerOrientation < MAX_UPRIGHT_DIFFERENCE
        ) {
            const forwards = traffic.filter(i => i.direction === 1)
                .map(i => i.position[2])

            setPosition([-2, 2, Math.min(...forwards) - 6])
        }
    }, 150)
}
