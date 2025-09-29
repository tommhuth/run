import { useBody } from "@data/cannon"
import Config from "@data/Config"
import { store, setState, requestMotionPermission, useStore } from "@data/store"
import { clamp, ndelta } from "@data/utils"
import { Html } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Sphere, Vec3 } from "cannon-es"
import { useMemo, useEffect, useRef, startTransition } from "react"


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
    let betaR = e.beta / 180 * Math.PI
    let gammaR = e.gamma / 180 * Math.PI
    let rotationZ = Math.atan2(Math.cos(betaR) * Math.sin(gammaR), Math.sin(betaR))

    return rotationZ * 180 / Math.PI
}

const _forwardSpeed = new Vec3()

interface PlayerProps {
    radius?: number
    forwardSpeed?: number
    debug?: boolean
}

export default function Player({ radius = .2, forwardSpeed = 3 }: PlayerProps) {
    let shape = useMemo(() => new Sphere(radius), [])
    let [meshRef, body] = useBody({
        mass: 2,
        definition: shape,
        position: [0, 1, 0],
    })
    let motion = useMemo<Motion>(() => ({
        alpha: 0,
        beta: 0,
        gamma: 0,
        spin: 0,
        initialSpin: null,
    }), [])
    let debugRef = useRef<HTMLDivElement>(null)
    let keys = useMemo<Record<string, boolean>>(() => ({}), [])
    let hasMotionAccess = useStore(i => i.hasMotionAccess)

    useEffect(() => {
        setState({ player: { mesh: meshRef.current, body } })
    }, [])

    useEffect(() => {
        let keydown = (e: KeyboardEvent) => {
            keys[e.code] = true

            if (e.code === "Space") {
                body.velocity.y = 6.75
            }
        }
        let keyup = (e: KeyboardEvent) => {
            keys[e.code] = false
        }
        let pointerdown = () => {
            body.velocity.y = 6.75
        }

        window.addEventListener("keydown", keydown)
        window.addEventListener("keyup", keyup)
        window.addEventListener("pointerdown", pointerdown, { passive: true })

        return () => {
            window.removeEventListener("keydown", keydown)
            window.removeEventListener("keyup", keyup)
            window.removeEventListener("pointerdown", pointerdown)
        }
    }, [body])

    useEffect(() => {
        if (hasMotionAccess) {
            return
        }

        let click = async () => {
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
    }, [hasMotionAccess])

    useEffect(() => {
        if (!hasMotionAccess) {
            return
        }

        let deviceorientation = (e: DeviceOrientationEvent) => {
            if (e.alpha === null) {
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
    }, [hasMotionAccess])

    useEffect(() => {
        let click = () => {
            let { state } = store.getState()

            if (["gameover", "intro"].includes(state)) {
                setState({ state: "running" })
            }
        }

        window.addEventListener("click", click, { passive: true })

        return () => {
            window.removeEventListener("click", click)
            window.removeEventListener("touchstart", click)
        }
    }, [])

    useFrame((_, delta) => {
        let { state, path, player } = store.getState()
        let playerMesh = player.mesh
        let nd = ndelta(delta)


        if (state !== "running" || !playerMesh) {
            return
        }

        if (body.velocity.length() < forwardSpeed) {
            body.applyForce(_forwardSpeed.set(0, 0, forwardSpeed))
        }

        body.wakeUp()

        if (keys.KeyA) {
            body.velocity.x += 6 * nd
        } else if (keys.KeyD) {
            body.velocity.x -= 6 * nd
        } else if (motion.initialSpin !== null) {
            let deltaRotation = motion.initialSpin - getRotationZ(motion)
            let deadzone = 2
            let fadedist = 2
            let scale = clamp((Math.abs(deltaRotation) - deadzone) / fadedist, 0, 1)
            let horizontalSpeed = 10
            let range = 60

            body.velocity.x = clamp(deltaRotation / range, -1, 1) * scale * horizontalSpeed
        }

        let bottomBuffer = 3
        let activeSection = path.find(({ size, position }) => {
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
            velx=${body.velocity.x.toFixed(3)}
        `
    })

    return (
        <mesh
            ref={meshRef}
            castShadow
            receiveShadow
        >
            <sphereGeometry args={[radius, 24, 24]} />
            <meshPhongMaterial dithering color="red" name="player" />

            {Config.DEBUG && (
                <Html>
                    <div ref={debugRef} />
                </Html>
            )}
        </mesh>
    )
}
