import { useLowerPriorityFrame } from "@data/hooks/utils"
import { removeTrafficElement } from "@data/store/actions/traffic"
import { TrafficElement, useStore } from "@data/store/store"
import { extractRotation } from "@data/utils"
import { Tuple3 } from "@src/types/global"
import { Vec3 } from "cannon-es"
import { Dispatch, SetStateAction } from "react"

import { ROAD_GAME_OVER_X_EDGE } from "../const"

const MAX_ROTATION = Math.PI * .5 * .875
const MAX_UPRIGHT_DIFFERENCE = .5

const _up = new Vec3(0, 1, 0)
const _orientation = new Vec3()

export default function usePlayerAlive(
    setPlayerPosition: Dispatch<SetStateAction<Tuple3>>
) {
    useLowerPriorityFrame(() => {
        const {
            player: { vehicle },
            traffic,
            debug,
            road,
            state
        } = useStore.getState()

        if (!vehicle || debug.godMode || state !== "running") {
            return
        }

        const backPart = road[0]
        const offsidedness = Math.abs(vehicle.chassisBody.position.x)
        const rotation = Math.abs(extractRotation(vehicle.chassisBody.quaternion).y)
        const playerOrientation = vehicle.chassisBody.quaternion
            .vmult(_up, _orientation)
            .dot(_up)
        const tooFarBack = vehicle.chassisBody.position.z < backPart.position[2] + backPart.depth * .5

        if (
            offsidedness > ROAD_GAME_OVER_X_EDGE ||
            rotation > MAX_ROTATION ||
            playerOrientation < MAX_UPRIGHT_DIFFERENCE ||
            tooFarBack
        ) {
            const resetPosition = backPart.position[2] + backPart.depth * .75
            const minGap = 10
            const closestTrafficElement = traffic
                .filter(i => i.direction === 1)
                .sort((a, b) => a.position[2] - b.position[2])
                .at(0) as TrafficElement

            if (closestTrafficElement.position[2] - resetPosition < minGap) {
                // if traffic too close to backwards edge, remove
                removeTrafficElement(closestTrafficElement.id)
            }

            // we could reset to same z as last time, 
            // add some randomness to force a remount
            setPlayerPosition([-2, 2, resetPosition + Math.random() * .1])
        }
    }, 100)
}
