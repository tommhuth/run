import React, { useEffect, useRef, useCallback, useState } from "react" 
import { Sphere, RaycastResult, Ray, Vec3 } from "cannon"
import { useCannon, useWorld } from "../data/cannon"
import { useFrame } from "react-three-fiber"
import { useStore } from "../data/store"
import GameState from "../data/const/GameState"
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
        position: [0, 3, 0]
    })
    let frames = useRef(0)
    let boom = useCallback(() => {
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
    }, [body, world])

    useFrame(() => {
        if (state === GameState.RUNNING) {
            if (body.velocity.z < .5 && frames.current > 3) {
                actions.end()
            }

            body.velocity.z = speed
            frames.current++
            actions.setPosition(body.position.x, body.position.y, body.position.z)
        }
    })


    // jump set on collision
    useEffect(() => {
        if (body && state === GameState.RUNNING) {
            body.addEventListener("collide", ({ body: target }) => {
                // if collieded body is below player,
                // we hit the "top" of the other body and can jump again
                let intersection = intersectBody(
                    body.position.toArray(),
                    [body.position.x, body.position.y - 50, body.position.z],
                    target
                )

                if (intersection.hasHit) {
                    //actions.setBaseY(body.position.y)
                    setCanJump(true)
                }
            })
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
        root.addEventListener("touchstart", onTouchStart)

        return () => {
            root.removeEventListener("click", onClick)
            root.removeEventListener("touchstart", onTouchStart)
        }
    }, [body, speed, canJump, state])

    return (
        <>
            <HTML className="ui" top="5vh" left="5vw">
                <h1>{state}</h1>
            </HTML> 
            <mesh ref={ref}>
                <meshPhongMaterial
                    attach={"material"}
                    args={[{
                        color: 0xfffb1f,
                        transparent: true,
                        opacity: .65,
                        flatShading: true,
                        emissive: 0xfffb1f,
                        emissiveIntensity: 1
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

 