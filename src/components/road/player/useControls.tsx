import { store } from "@data/store/store"
import { clamp } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import { Tuple2 } from "@src/types/global"
import { useEffect, useMemo } from "react"

const config = {
    touchXDistance: 100,
    touchYDistance: 55,
    baseForce: 106,
    forceScaler: 3,
    forceScalerDistance: 4,
    baseSteering: .25,
    velocityPenaltyAmount: .65,
    velocityPenaltyStart: 5,
    velocityPenaltyDistance: 4,
}

export function useControls() {
    const keys = useMemo<Record<string, boolean | number>>(() => ({}), [])
    const motion = useMemo(() => {
        return {
            steering: 0,
            wheelForce: 0,
            currentSteering: 0,
            currentWheelForce: 0,
        }
    }, [])

    useEffect(() => {
        const onkeydown = (e: KeyboardEvent) => {
            keys[e.key.toLowerCase()] = true
        }
        const onkeyup = (e: KeyboardEvent) => {
            keys[e.key.toLowerCase()] = false
        }

        window.addEventListener("keydown", onkeydown)
        window.addEventListener("keyup", onkeyup)

        return () => {
            window.removeEventListener("keydown", onkeydown)
            window.removeEventListener("keyup", onkeyup)
        }
    }, [keys])

    useEffect(() => {
        let start: Tuple2 = [0, 0]
        const pointerdown = (e: PointerEvent) => {
            if (e.pointerType !== "touch") {
                return
            }

            start = [e.clientX, e.clientY]
        }
        const pointermove = (e: PointerEvent) => {
            if (e.pointerType !== "touch") {
                return
            }

            keys.touchX = clamp((start[0] - e.clientX) / config.touchXDistance, -1, 1)
            keys.touchY = clamp((start[1] - e.clientY) / config.touchYDistance, -1, 1)
        }
        const pointerup = (e: PointerEvent) => {
            if (e.pointerType !== "touch") {
                return
            }

            keys.touchX = false
            keys.touchY = false
        }

        window.addEventListener("pointerdown", pointerdown)
        window.addEventListener("pointermove", pointermove)
        window.addEventListener("pointerup", pointerup)

        return () => {
            window.removeEventListener("pointerdown", pointerdown)
            window.removeEventListener("pointermove", pointermove)
            window.removeEventListener("pointerup", pointerup)
        }
    }, [keys])

    useFrame(() => {
        const { player } = store.getState()
        const velocity = player.vehicle?.chassisBody.velocity.length() || 0
        const forceScaler = (1 - clamp((velocity) / config.forceScalerDistance))
            * config.forceScaler + 1
        const velocityPenality = (1 - clamp((velocity - config.velocityPenaltyStart) / config.velocityPenaltyDistance))
            * config.velocityPenaltyAmount + (1 - config.velocityPenaltyAmount)

        if (typeof keys.touchY === "number") {
            motion.wheelForce = config.baseForce * keys.touchY * forceScaler
        } else if (keys.w || keys.ArrowUp) {
            motion.wheelForce = config.baseForce * forceScaler
        } else if (keys.s || keys.ArrowDown) {
            motion.wheelForce = -config.baseForce * forceScaler
        } else {
            motion.wheelForce = 0
        }

        if (typeof keys.touchX === "number") {
            motion.steering = config.baseSteering * keys.touchX
        } else if (keys.a) {
            motion.steering = config.baseSteering
        } else if (keys.d) {
            motion.steering = -config.baseSteering
        } else {
            motion.steering = 0
        }

        motion.currentSteering = motion.steering * velocityPenality
        motion.currentWheelForce = motion.wheelForce
    })

    return { keys, motion }
}
