import { useBody } from "@data/cannon"
import { store, setState, requestMotionPermission, useStore } from "@data/store"
import { clamp, ndelta } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import { Sphere, Vec3 } from "cannon-es"
import { useMemo, useEffect } from "react"
import { damp } from "three/src/math/MathUtils.js"

interface PlayerProps {
    radius?: number
    speed?: number
    debug?: boolean
}

export default function Player({ radius = .2, speed = 3 }: PlayerProps) {
    let shape = useMemo(() => new Sphere(radius), [])
    let [ref, body] = useBody({
        mass: 2,
        definition: shape,
        position: [0, 1, 0],
    })
    let motion = useMemo(() => ({ alpha: 0, beta: 0, gamma: 0 }), [])
    let keys = useMemo<Record<string, boolean>>(() => ({}), [])
    let hasMotionAccess = useStore(i => i.hasMotionAccess)

    useEffect(() => {
        setState({ player: { mesh: ref.current, body } })
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
        window.addEventListener("pointerdown", pointerdown)

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

        window.addEventListener("click", click)

        return () => {
            window.removeEventListener("click", click)
        }
    }, [hasMotionAccess])

    useEffect(() => {
        if (!hasMotionAccess) {
            return
        }

        let deviceorientation = (e: DeviceOrientationEvent) => {
            motion.alpha = e.alpha || 0
            motion.beta = e.beta || 0
            motion.gamma = e.gamma || 0
        }

        window.addEventListener("deviceorientation", deviceorientation)

        return () => {
            window.removeEventListener("deviceorientation", deviceorientation)
        }
    }, [hasMotionAccess])

    useEffect(() => {
        let pointerdown = () => {
            let { state, hasMotionAccess } = store.getState()

            if (["gameover", "intro"].includes(state) && hasMotionAccess) {
                setState({ state: "running" })
            }
        }

        window.addEventListener("pointerdown", pointerdown)

        return () => {
            window.removeEventListener("pointerdown", pointerdown)
        }
    }, [])

    useFrame((_, delta) => {
        let { state, path, player } = store.getState()
        let playerMesh = player.mesh
        let buffer = 15
        let deadzone = 15
        let nd = ndelta(delta)

        if (state !== "running" || !playerMesh) {
            return
        }

        body.wakeUp()

        if (keys.KeyA) {
            body.velocity.x += 6 * nd
        } else if (keys.KeyD) {
            body.velocity.x -= 6 * nd
        } else if (Math.abs(motion.gamma) > 0) {
            let scale = clamp(Math.abs((motion.gamma - deadzone) / buffer), 0, 1)
            let speed = 4
            let gamma = (-motion.gamma * scale / 90) * speed * (motion.beta < 90 ? 1 : -1)

            body.velocity.x = damp(body.velocity.x, gamma, 6, nd)
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
        let { state } = store.getState()

        if (body.velocity.length() < speed && state === "running") {
            body.applyForce(new Vec3(0, 0, speed))
        }
    })


    return (
        <mesh
            ref={ref}
            castShadow
            receiveShadow
        >
            <sphereGeometry args={[radius, 16, 16]} />
            <meshPhongMaterial dithering color="red" name="player" />
        </mesh>
    )
}
