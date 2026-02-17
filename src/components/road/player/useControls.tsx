import { store } from "@data/store"
import { clamp } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import { Tuple2 } from "@src/types/global"
import { useEffect, useMemo } from "react"
import { lerp } from "three/src/math/MathUtils.js"

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
            keys[e.key] = true
        }
        const onkeyup = (e: KeyboardEvent) => {
            keys[e.key] = false
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

            keys.touchX = clamp((start[0] - e.clientX) / 120, -1, 1)
            keys.touchY = clamp((start[1] - e.clientY) / 75, -1, 1)
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
        const steer = .25
        const force = 85

        if (typeof keys.touchY === "number") {
            motion.wheelForce = force * keys.touchY
        } else if (keys.w || keys.ArrowUp) {
            motion.wheelForce = force
        } else if (keys.s || keys.ArrowDown) {
            motion.wheelForce = -force
        } else {
            motion.wheelForce = 0
        }

        if (typeof keys.touchX === "number") {
            motion.steering = steer * keys.touchX
        } else if (keys.a) {
            motion.steering = steer
        } else if (keys.d) {
            motion.steering = -steer
        } else {
            motion.steering = 0
        }

        motion.currentSteering = lerp(motion.currentSteering, motion.steering, .35)
        motion.currentWheelForce = lerp(motion.currentWheelForce, motion.wheelForce, .65)

        const velocity = store.getState().player.vehicle?.chassisBody.velocity.length() || 0
        const speedPenality = clamp((velocity - 5) / 5, 0, 1)

        motion.currentSteering *= (1 - speedPenality) * .25 + .75
    })

    return { keys, motion }
}
