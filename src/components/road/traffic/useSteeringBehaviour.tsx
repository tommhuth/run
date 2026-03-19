import { store, useStore } from "@data/store"
import { clamp, map, ndelta, useLowerPriorityFrame } from "@data/utils"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { RigidVehicle, Vec3 } from "cannon-es"
import { useMemo } from "react"

import { ROAD_CENTER_X } from "../const"
import useTrafficClient from "./useTrafficClient"

const MAX_STEER = 0.3

interface UseSteeringBehaviourParams {
    trafficElementId: string
    vehicle: RigidVehicle | null
    guide: Tuple3
    direction: number
    maxVelocity?: number
    wheelForce?: number
    kp?: number // proportional gain
    kv?: number // x velocity gain
}

const adjustInterval = [1400, 4000] as const

const _tempVec1 = new Vec3()
const _tempVec2 = new Vec3()
const _tempVec3 = new Vec3()

export default function useSteeringBehaviour({
    vehicle,
    guide,
    direction,
    maxVelocity = 6,
    wheelForce = 75,
    kp = .05,
    kv = .2
}: UseSteeringBehaviourParams) {
    const client = useTrafficClient({ vehicle, type: "traffic", direction })
    const data = useMemo(() => ({
        adjustAt: random.integer(...adjustInterval),
        speeding: 1,
        playerStopTime: 0,
        time: 0,
    }), [])

    useFrame((state, delta) => {
        const { player } = store.getState()

        if (!player.vehicle) {
            return
        }

        if (player.vehicle.chassisBody.velocity.length() < .5) {
            data.playerStopTime += ndelta(delta) * 1000
        } else {
            data.playerStopTime = 0
        }
    })

    // x
    useFrame(() => {
        if (!vehicle) {
            return
        }

        const chassis = vehicle.chassisBody
        const error = guide[0] - chassis.position.x
        // simple proportional controller with lateral x velocity counter
        const steer = clamp(kp * error - kv * chassis.velocity.x, -MAX_STEER, MAX_STEER)

        for (const wheel of [0, 1]) {
            vehicle.setSteeringValue(steer * direction, wheel)
        }
    })

    // stop calc
    useLowerPriorityFrame(() => {
        if (!client || !vehicle) {
            return
        }

        const grid = useStore.getState().grid
        const vehiclePosition = vehicle.chassisBody.position
        const size = 10
        const near = grid.findNear(vehiclePosition.toArray(), [size, 5, size])
        let speeding = 1

        for (const clientNear of near) {
            if (client === clientNear) {
                continue
            }

            const inFronThreshold = .9
            const directionSimilarity = _tempVec1.copy(vehiclePosition)
                .vsub(clientNear.data.vehicle.chassisBody.position)
                .unit()
                .dot(_tempVec3.set(0, 0, -direction))
            const distanceThreshold = 7
            const distance = clamp(vehiclePosition.distanceTo(_tempVec2.copy(clientNear.data.vehicle.chassisBody.position)) / distanceThreshold)

            if (directionSimilarity > inFronThreshold) {
                speeding = Math.min(distance, speeding)
            }
        }

        data.speeding = speeding
    }, 5)

    // z
    useFrame(() => {
        const { player } = store.getState()

        if (!vehicle || !player.vehicle) {
            return
        }

        const currentVelocity = vehicle.chassisBody.velocity.length()
        const playerStopThreshold = 1_600
        let currentWheelForce = 0 // default no speeding

        if (data.speeding < 1 || (data.playerStopTime > playerStopThreshold && direction === 1)) {
            // obstacle detected, or player stopped, we should slow down
            const stopForce = clamp(vehicle.chassisBody.velocity.length() / (maxVelocity * .2))
            // limit to direction relevant movement only
            const directionScale = _tempVec1.copy(vehicle.chassisBody.velocity)
                .unit()
                .dot(_tempVec2.set(0, 0, direction))

            currentWheelForce = -wheelForce * stopForce * clamp(directionScale)
        } else if (currentVelocity < maxVelocity) {
            // normal forward movement
            const scaler = map(currentVelocity / maxVelocity, 0, 1, 2.5, 1)

            currentWheelForce = wheelForce * scaler
        }

        for (const wheel of [2, 3]) {
            vehicle.setWheelForce(currentWheelForce, wheel)
        }
    })

    useFrame((state, delta) => {
        data.time += ndelta(delta) * 1000

        if (data.time > data.adjustAt) {
            guide[0] = ROAD_CENTER_X * -direction + random.pick(.25, .65, 1) * random.pick(-1, 1)
            data.time = 0
            data.adjustAt = random.integer(...adjustInterval)
        }
    })
}
