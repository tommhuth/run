import { ROAD_CENTER_X } from "@components/road/Road"
import { store } from "@data/store"
import { clamp, map } from "@data/utils"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { RigidVehicle } from "cannon-es"
import { useMemo } from "react"

const MAX_STEER = 0.3
const MAX_STEER_RATE = 1.2

interface UseSteeringBehaviourParams {
    vehicle: RigidVehicle | null
    target: Tuple3
    direction: number
    targetVelocity?: number
    wheelForce?: number
    kp?: number // position gain
    kd?: number // derivative on error  
    kv?: number // gain on lateral velocity (important to counter inertia)
}

// chattyman https://chatgpt.com/c/69062faa-a95c-832d-84ca-11456a40f84f
// https://en.wikipedia.org/wiki/Proportional%E2%80%93integral%E2%80%93derivative_controller
export default function useSteeringBehaviour({
    vehicle,
    target,
    direction,
    targetVelocity = 6,
    wheelForce = 20,
    kp = .1,
    kd = .02,
    kv = .2
}: UseSteeringBehaviourParams) {
    const data = useMemo(() => ({
        prevError: 0,
        prevSteer: 0,
        adjustAt: random.integer(700, 1400),
        time: 0,
    }), [])

    useFrame((state, delta) => {
        data.time += delta * 1000

        if (data.time > data.adjustAt) {
            target[0] = ROAD_CENTER_X * -direction + random.float(-1, 1)
            data.time = 0
            data.adjustAt = random.integer(1100, 3000)
        }
    })

    // z
    useFrame(() => {
        const { player } = store.getState()

        if (!vehicle || !player.vehicle) {
            return
        }

        const currentVelocity = vehicle.chassisBody.velocity.length()
        const playerVelocity = player.vehicle?.chassisBody.velocity.length()
        const slow = direction === 1 ? clamp(playerVelocity / 20, 0, 1) : 1
        const scaler = map(currentVelocity / targetVelocity, 0, 1, 2.5, 1)

        if (currentVelocity < targetVelocity) {
            vehicle.setWheelForce(wheelForce * scaler * slow, 2)
            vehicle.setWheelForce(wheelForce * scaler * slow, 3)
        } else {
            vehicle.setWheelForce(0, 2)
            vehicle.setWheelForce(0, 3)
        }
    })

    // x
    useFrame((state, dt) => {
        if (!vehicle) {
            return
        }

        const chassis = vehicle.chassisBody
        const error = target[0] - chassis.position.x
        const errorRate = (error - data.prevError) / dt

        // lateral velocity in world X (momentum across the path)  
        // PD + velocity damping (note the sign: subtract lateralVel to oppose motion)
        let steer = kp * error - kd * errorRate - kv * chassis.velocity.x

        // clamp steer
        steer = clamp(steer, -MAX_STEER, MAX_STEER)

        // limit steer rate to avoid sudden jumps
        const maxDelta = MAX_STEER_RATE * dt
        const delta = steer - data.prevSteer

        if (delta > maxDelta) {
            steer = data.prevSteer + maxDelta
        }

        if (delta < -maxDelta) {
            steer = data.prevSteer - maxDelta
        }

        vehicle.setSteeringValue(steer * direction, 0)
        vehicle.setSteeringValue(steer * direction, 1)

        data.prevSteer = steer
        data.prevError = error
    })
}
