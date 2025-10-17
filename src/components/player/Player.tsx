import useWaterIntersection from "@components/materials/useWaterIntersecton"
import { useBody } from "@data/cannon"
import Config from "@data/Config"
import { store } from "@data/store"
import { setState } from "@data/store/actions"
import { clamp, ndelta, } from "@data/utils"
import { Html } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Sphere, Vec3 } from "cannon-es"
import { useEffect, useMemo, useRef } from "react"
import { mergeRefs } from "react-merge-refs"

import { useControls } from "./useControls"
import usePlayerAlive from "./usePlayerAlive"

const _forwardSpeed = new Vec3()

interface PlayerProps {
    radius?: number
    forwardSpeed?: number
}

export default function Player({ radius = .2, forwardSpeed = 4 }: PlayerProps) {
    const shape = useMemo(() => new Sphere(radius), [])
    const [meshRef, body] = useBody({
        mass: 2,
        definition: shape,
        position: [0, 1, 0],
    })
    const debugRef = useRef<HTMLDivElement>(null)
    const intersectionRef = useWaterIntersection({
        size: [radius * 2, radius * 2, radius * 2],
        type: "circle",
        threshold: radius * .5
    })
    const ref = mergeRefs([meshRef, intersectionRef])
    const { motion, keys } = useControls()

    usePlayerAlive()

    useEffect(() => {
        setState({ player: { mesh: meshRef.current, body } })
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
        const { state } = store.getState()
        const nd = ndelta(delta)

        if (state !== "running") {
            return
        }

        body.wakeUp()

        if (body.velocity.length() < forwardSpeed) {
            body.applyForce(_forwardSpeed.set(0, 0, forwardSpeed))
        }

        if (typeof keys.jump === "number") {
            body.velocity.y = 7 * keys.jump
            keys.jump = false
        } else if (keys.KeyA) {
            body.velocity.x += 6 * nd
        } else if (keys.KeyD) {
            body.velocity.x -= 6 * nd
        } else if (motion.initialSpin !== null) {
            const deltaRotation = motion.initialSpin - motion.currentSpin
            const deadzone = 2
            const fadedist = 2
            const scale = clamp((Math.abs(deltaRotation) - deadzone) / fadedist, 0, 1)
            const horizontalSpeed = 16
            const range = 60

            body.velocity.x = clamp(deltaRotation / range, -1, 1) * scale * horizontalSpeed
        }
    })

    useFrame(() => {
        if (!debugRef.current) {
            return
        }

        debugRef.current.innerHTML = ` 
            spin=${motion.currentSpin?.toFixed(3)}<br/> 
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
