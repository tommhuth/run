import { useBody } from "@data/cannon"
import { store, setState } from "@data/store"
import { Html } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Sphere, Vec3 } from "cannon-es"
import { useMemo, useEffect, useState, useRef } from "react"

interface PlayerProps {
    radius?: number
    speed?: number
}

interface DeviceMotionEventiOS extends DeviceMotionEvent {
    requestPermission?: () => Promise<"granted" | "denied">;
}

let hasRequestPermission = !!(DeviceMotionEvent as unknown as DeviceMotionEventiOS).requestPermission

function requestMotionPermission() {
    let event = DeviceMotionEvent as unknown as DeviceMotionEventiOS

    if (event.requestPermission) {
        return event.requestPermission()
    }
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
    let [motionAccess, setMotionAccess] = useState(hasRequestPermission ? false : true)

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
        if (motionAccess) {
            return
        }

        let pointerdown = async () => {
            let { state } = store.getState()

            if (state === "intro" && hasRequestPermission) {
                try {
                    let permission = await requestMotionPermission()

                    alert(permission)

                    setMotionAccess(permission === "granted")
                } catch (e) {
                    alert(e.message)
                }

            }
        }

        window.addEventListener("click", pointerdown)

        return () => {
            window.removeEventListener("click", pointerdown)
        }
    }, [motionAccess])

    useEffect(() => {
        if (!motionAccess) {
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
    }, [motionAccess])

    useEffect(() => {
        let pointerdown = () => {
            let { state } = store.getState()

            if (["gameover", "intro"].includes(state)) {
                setState({ state: "running" })
            }
        }

        window.addEventListener("pointerdown", pointerdown)

        return () => {
            window.removeEventListener("pointerdown", pointerdown)
        }
    }, [])

    useFrame(() => {
        let { state, path, player } = store.getState()
        let playerMesh = player.mesh

        if (keys.KeyA) {
            body.velocity.x += .1
        }
        if (keys.KeyD) {
            body.velocity.x -= .1
        }

        if (playerMesh && state === "running") {
            let bottomBuffer = 3
            let currentSection = path.find(({ size, position }) => {
                return position[2] - size[2] / 2 < playerMesh.position.z
                    && position[2] + size[2] / 2 > playerMesh.position.z
            })

            if (!currentSection) {
                return
            }

            if (currentSection.position[1] + currentSection.size[1] / 2 - bottomBuffer > playerMesh.position.y) {
                setState({ state: "gameover" })
            }
        }
    })

    useFrame(() => {
        let { state } = store.getState()

        if (body.velocity.length() < speed && state === "running") {
            body.applyForce(new Vec3(0, 0, speed))
        }
    })

    let r = useRef<HTMLDivElement>(null)

    useFrame(() => {
        if (!r.current) {
            return
        }

        r.current.innerHTML = `
            hasRequestPermission=${JSON.stringify(hasRequestPermission)}<br/>
            motionAccess=${JSON.stringify(motionAccess)}<br/>
            alpha=${motion.alpha.toFixed(5)} <br/>
            beta=${motion.beta.toFixed(5)} <br/>
            gamma=${motion.gamma.toFixed(5)}  
        `
    })

    return (
        <>
            <mesh ref={ref} castShadow receiveShadow>
                <sphereGeometry args={[radius, 16, 16]} />
                <meshPhongMaterial dithering color="red" />
                <Html>
                    <div ref={r}>

                    </div>
                </Html>
            </mesh>
        </>
    )
}