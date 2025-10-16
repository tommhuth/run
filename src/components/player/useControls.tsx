import { store } from "@data/store"
import { requestMotionPermission } from "@data/store/actions"
import { useEffect, useMemo } from "react"

interface Motion {
    currentSpin: number
    initialSpin: number | null
}

// this is sick? https://stackoverflow.com/a/42799567 
// https://developer.mozilla.org/en-US/docs/Web/API/Device_orientation_events/Orientation_and_motion_data_explained
// axis move with device so raw values alone doesn’t map cleanly to Z rotation
// this fixes that: project beta - gamma onto a plane perpendicular to the forward axis (Z)
function getRotationZ(beta: number, gamma: number) {
    const betaR = beta / 180 * Math.PI
    const gammaR = gamma / 180 * Math.PI
    const rotationZ = Math.atan2(Math.cos(betaR) * Math.sin(gammaR), Math.sin(betaR))

    return rotationZ * 180 / Math.PI
}

export function useControls() {
    const motion = useMemo<Motion>(() => ({
        currentSpin: 0,
        initialSpin: null,
    }), [])
    const keys = useMemo<Record<string, boolean>>(() => ({}), [])

    useEffect(() => {
        const keydown = (e: KeyboardEvent) => {
            keys[e.code] = true

            if (e.code === "Space") {
                keys.jump = true
            }
        }
        const keyup = (e: KeyboardEvent) => {
            keys[e.code] = false
        }
        const pointerdown = () => {
            keys.jump = true
        }
        const ignore = (e) => {
            e.preventDefault()
        }

        window.addEventListener("keydown", keydown)
        window.addEventListener("keyup", keyup)
        window.addEventListener("mousedown", pointerdown, { passive: true })
        window.addEventListener("touchstart", pointerdown, { passive: true })
        window.addEventListener("touchcancel", ignore, { passive: false })

        return () => {
            window.removeEventListener("keydown", keydown)
            window.removeEventListener("keyup", keyup)
            window.removeEventListener("mousedown", pointerdown)
            window.removeEventListener("touchstart", pointerdown)
            window.removeEventListener("touchcancel", ignore)
        }
    }, [])

    useEffect(() => {
        const deviceorientation = (e: DeviceOrientationEvent) => {
            let { hasMotionAccess } = store.getState()

            if (e.beta === null || e.gamma === null || !hasMotionAccess) {
                return
            }

            motion.currentSpin = getRotationZ(e.beta, e.gamma)
            motion.initialSpin = motion.initialSpin === null ? motion.currentSpin : motion.initialSpin
        }

        window.addEventListener("deviceorientation", deviceorientation)

        return () => {
            window.removeEventListener("deviceorientation", deviceorientation)
        }
    }, [])

    useEffect(() => {
        const click = async () => {
            let { hasMotionAccess } = store.getState()

            if (hasMotionAccess) {
                return
            }

            try {
                await requestMotionPermission()
            } catch {
                // nothing 
            }
        }

        window.addEventListener("click", click, { passive: true })

        return () => {
            window.removeEventListener("click", click)
        }
    }, [])

    return { motion, keys }
}
