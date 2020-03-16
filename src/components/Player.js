import React, { useEffect, useRef, useCallback, useState } from "react"
import { Sphere, RaycastResult, Ray, Vec3 } from "cannon"
import { useCannon, useWorld } from "../data/cannon"
import { useFrame } from "react-three-fiber"
import { useStore } from "../data/store"
import Config from "../data/Config"
import GameState from "../data/const/GameState"
import Only from "./Only"
import HTML from "./HTML"

function intersectBody(from, to, body) {
    let result = new RaycastResult()
    let ray = new Ray(
        new Vec3(...from),
        new Vec3(...to)
    )

    ray.intersectBody(body, result)

    return result
}

export default function Player({
    speed = 4
}) {
    let world = useWorld()
    let state = useStore(state => state.data.state) 
    let hasDeviceOrientation = useStore(state => state.data.hasDeviceOrientation)
    let actions = useStore(state => state.actions)
    let [canJump, setCanJump] = useState(true)
    let { ref, body } = useCannon({
        shape: new Sphere(1),
        collisionFilterGroup: 2,
        collisionFilterMask: 1 | 2 | 4 | 8,
        active: true,
        mass: 1,
        position: [0, 2, 40]
    })
    let frames = useRef([])
    let boom = useCallback(() => {
        if (actions.reduceTime()) {
            let player = body
            let enemies = world.bodies.filter(i => i.customData?.enemy)
            let limit = 15

            for (let enemy of enemies) {
                let distance = player.position.distanceTo(enemy.position)

                if (distance < limit) {
                    let force = Math.min(Math.max(0, 1 - distance / limit), 1) * 25
                    let direction = enemy.position.clone()
                        .vsub(player.position.clone())
                        .unit()
                        .mult(force * enemy.mass)

                    enemy.applyImpulse(direction, enemy.position)
                }
            }
        }
    }, [body, world])

    useFrame(() => {
        if (state === GameState.RUNNING) {
            let frameCount = 3

            if (frames.current.length === frameCount && !Config.DEBUG_MODE) {
                let averageVelocity = frames.current.reduce((total, current) => total + current, 0) / frameCount

                if (averageVelocity < 2) {
                    actions.end("U crashed")
                }
            }

            frames.current = [...frames.current.slice(-(frameCount - 1)), body.velocity.z]
            body.velocity.z = speed
            actions.setPosition(body.position.x, body.position.y, body.position.z)
        }
    })

    // jump set on collision
    useEffect(() => {
        if (body && state === GameState.RUNNING) {
            let listener = ({ body: target }) => {
                // if collieded body is below player,
                // we hit the "top" of the other body and can jump again
                let intersection = intersectBody(
                    body.position.toArray(),
                    [body.position.x, body.position.y - 50, body.position.z],
                    target
                )

                if (intersection.hasHit) {
                    setCanJump(true)
                }
            }

            body.addEventListener("collide", listener)

            return () => body.removeEventListener("collide", listener)
        }
    }, [body, state])

    // boom
    useEffect(() => {
        let onKeyDown = ({ which }) => {
            if (which === 32) {
                boom()
            }
        }

        window.addEventListener("keydown", onKeyDown)

        return () => window.removeEventListener("keydown", onKeyDown)
    }, [boom])

    // left/right
    useEffect(() => {
        let onMouseMove = (e) => {
            if (state !== GameState.RUNNING) {
                return
            }

            let v = (e.clientX - (window.innerWidth / 2)) / (window.innerWidth / 2)

            body.velocity.x = v * -speed * 3
        }
        let onDeviceOrientation = e => {
            if (state !== GameState.RUNNING) {
                return
            }

            let max = speed * 3
            let velocity = -e.gamma / 50 * max

            body.velocity.x = velocity
        }

        window.addEventListener("mousemove", onMouseMove)

        if (hasDeviceOrientation) {
            window.addEventListener("deviceorientation", onDeviceOrientation)
        }

        return () => {
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("deviceorientation", onDeviceOrientation)
        }
    }, [body, hasDeviceOrientation, speed, state])

    // jump
    useEffect(() => {
        let root = document.getElementById("root")
        let onClick = () => {
            if (state !== GameState.RUNNING) {
                return
            }

            if (canJump) {
                body.velocity.y = speed * 2.5
                setCanJump(false)
            }
        }
        let onTouchStart = (e) => {
            if (state === GameState.RUNNING) {
                e.preventDefault()
            }

            onClick()
        }

        root.addEventListener("click", onClick)
        root.addEventListener("touchstart", onTouchStart, { passive: !hasDeviceOrientation })

        return () => {
            root.removeEventListener("click", onClick)
            root.removeEventListener("touchstart", onTouchStart, { passive: !hasDeviceOrientation })
        }
    }, [body, speed, canJump, state, hasDeviceOrientation])

    return (
        <> 
            <Only if={state === GameState.RUNNING}>
                <HTML>
                    <button
                        className="boom"
                        onClick={(e) => {
                            e.stopPropagation()
                            boom()
                        }}
                    >
                        Bitch
                    </button>
                </HTML> 
            </Only>
            <mesh ref={ref}>
                <meshLambertMaterial
                    attach={"material"}
                    args={[{
                        color: 0xfffff0, 
                        flatShading: true,
                        emissive: 0xfffff0,
                        emissiveIntensity: 10
                    }]}
                />
                <sphereBufferGeometry
                    attach="geometry"
                    args={[1, 12, 6, 6]}
                />
            </mesh>
        </>
    )
}

