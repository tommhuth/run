import { useBody } from "@data/cannon"
import Config from "@data/Config"
import { store, useStore } from "@data/store"
import { requestMotionPermission, setState } from "@data/store/actions"
import useWaterIntersection from "@data/useWaterIntersecton"
import { clamp, ndelta, } from "@data/utils"
import { Html } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Sphere, Vec3 } from "cannon-es"
import { useEffect, useMemo, useRef } from "react"
import { mergeRefs } from "react-merge-refs"


interface Motion {
    alpha: number
    beta: number
    gamma: number
    spin: number
    initialSpin: number | null
}

// this is sick? https://stackoverflow.com/a/42799567 
// https://developer.mozilla.org/en-US/docs/Web/API/Device_orientation_events/Orientation_and_motion_data_explained
// axis move with device so raw values alone doesn’t map cleanly to Z rotation
// this fixes that: project beta - gamma onto a plane perpendicular to the forward axis (Z)
function getRotationZ(e: Motion) {
    const betaR = e.beta / 180 * Math.PI
    const gammaR = e.gamma / 180 * Math.PI
    const rotationZ = Math.atan2(Math.cos(betaR) * Math.sin(gammaR), Math.sin(betaR))

    return rotationZ * 180 / Math.PI
}

const _forwardSpeed = new Vec3()

interface PlayerProps {
    radius?: number
    forwardSpeed?: number
    debug?: boolean
}

export default function Player({ radius = .2, forwardSpeed = 4 }: PlayerProps) {
    const shape = useMemo(() => new Sphere(radius), [])
    const [meshRef, body] = useBody({
        mass: 2,
        definition: shape,
        position: [0, 1, 0],
    })
    const motion = useMemo<Motion>(() => ({
        alpha: 0,
        beta: 0,
        gamma: 0,
        spin: 0,
        initialSpin: null,
    }), [])
    const debugRef = useRef<HTMLDivElement>(null)
    const keys = useMemo<Record<string, boolean>>(() => ({}), [])
    const intersectionRef = useWaterIntersection({
        size: [radius * 2, radius * 2, radius * 2],
        type: "circle",
        threshold: radius * .5
    })
    const ref = mergeRefs([meshRef, intersectionRef])

    useEffect(() => {
        setState({ player: { mesh: meshRef.current, body } })
    }, [])

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

        window.addEventListener("keydown", keydown)
        window.addEventListener("keyup", keyup)
        window.addEventListener("touchstart", pointerdown, { passive: true })
        window.addEventListener("mousedown", pointerdown, { passive: true })

        return () => {
            window.removeEventListener("keydown", keydown)
            window.removeEventListener("keyup", keyup)
            window.removeEventListener("pointerdown", pointerdown)
            window.removeEventListener("touchstart", pointerdown)
            window.removeEventListener("mousedown", pointerdown)
        }
    }, [body])

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

    useEffect(() => {
        const deviceorientation = (e: DeviceOrientationEvent) => {
            let { hasMotionAccess } = store.getState()

            if (e.alpha === null || !hasMotionAccess) {
                return
            }

            motion.alpha = e.alpha || 0
            motion.beta = e.beta || 0
            motion.gamma = e.gamma || 0

            if (motion.initialSpin === null) {
                // get initial orientation, average over x seconds instead?
                motion.initialSpin = getRotationZ(motion)
            }
        }

        window.addEventListener("deviceorientation", deviceorientation)

        return () => {
            window.removeEventListener("deviceorientation", deviceorientation)
        }
    }, [])

    useEffect(() => {
        const click = () => {
            const { state } = store.getState()

            if (["gameover", "intro"].includes(state)) {
                setState({ state: "running" })
            }
        }

        window.addEventListener("click", click, { passive: true })

        return () => {
            window.removeEventListener("click", click)
        }
    }, [])

    useFrame((_, delta) => {
        const { state, path, player } = store.getState()
        const playerMesh = player.mesh
        const nd = ndelta(delta)

        if (state !== "running" || !playerMesh) {
            return
        }

        if (body.velocity.length() < forwardSpeed) {
            body.applyForce(_forwardSpeed.set(0, 0, forwardSpeed))
        }

        body.wakeUp()

        if (keys.jump) {
            body.velocity.y = 6.75
            keys.jump = false
        }

        if (keys.KeyA) {
            body.velocity.x += 6 * nd
        } else if (keys.KeyD) {
            body.velocity.x -= 6 * nd
        } else if (motion.initialSpin !== null) {
            const deltaRotation = motion.initialSpin - getRotationZ(motion)
            const deadzone = 2
            const fadedist = 2
            const scale = clamp((Math.abs(deltaRotation) - deadzone) / fadedist, 0, 1)
            const horizontalSpeed = 10
            const range = 60

            body.velocity.x = clamp(deltaRotation / range, -1, 1) * scale * horizontalSpeed
        }

        const bottomBuffer = 3
        const activeSection = path.find(({ size, position }) => {
            return position[2] - size[2] / 2 < playerMesh.position.z
                && position[2] + size[2] / 2 > playerMesh.position.z
        })

        if (!activeSection) {
            return
        }

        if (activeSection.position[1] + activeSection.size[1] / 2 - bottomBuffer > playerMesh.position.y) {
            setState({ state: "gameover" })
        }
    })

    useFrame(() => {
        if (!debugRef.current) {
            return
        }

        debugRef.current.innerHTML = ` 
            spin=${motion.spin?.toFixed(3)}<br/> 
            initialSpin=${motion.initialSpin?.toFixed(3)}<br/> 
            velocity.x=${body.velocity.x.toFixed(3)}<br/>
            velocity.z=${body.velocity.z.toFixed(3)}
        `
    })

    return (
        <mesh
            ref={ref}
            castShadow
            receiveShadow
        >
            <sphereGeometry args={[radius, 24, 24]} />
            <meshPhongMaterial dithering color="#0ff" name="player" />

            {Config.DEBUG && (
                <Html>
                    <div ref={debugRef} />
                </Html>
            )}
        </mesh>
    )
}
