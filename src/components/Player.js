import React, { useState, useEffect, useMemo, useRef } from "react"
import { Sphere } from "cannon"
import { Vec3, Ray, RaycastResult } from "cannon"
import { useFrame } from "react-three-fiber"
import { useCannon, useWorld } from "../data/cannon"
import { useStore } from "../data/store"
import GameState from "../data/const/GameState"
import materials from "../data/materials"

export default function Player({
    position = [0, 2, 7],
    radius = .35
}) {
    let world = useWorld()
    let [body, setBody] = useState()
    let state = useStore(state => state.data.state)
    let baseY = useStore(state => state.data.baseY)
    let hasDeviceOrientation = useStore(state => state.data.hasDeviceOrientation)
    let [canJump, setCanJump] = useState(false)
    let actions = useStore(state => state.actions)
    let cannonConfig = useMemo(() => ({
        mass: 1,
        position,
        shape: new Sphere(radius),
        cb: setBody
    }), [])
    let ref = useCannon(cannonConfig)
    let forward = useRef(0)   

    // move forward
    useFrame(() => {
        if (state === GameState.RUNNING && body) {
            let hasForwardVelocity = forward.current > 2
            let hasFallenOff = body.position.y < baseY - 14
            let hasStopped = body.velocity.z < 1

            if ((hasFallenOff || hasStopped) && hasForwardVelocity) { 
                forward.current = 0
                actions.end()
            } else { 
                body.velocity.z = 2
                forward.current++
                actions.setPosition(body.position.x, body.position.y, body.position.z)
            }
        }
    })
 
    // move left/right 
    useEffect(() => {
        if (state === GameState.RUNNING && body) { 
            let max = 3
            let mouseMove = e => {
                let velocity = -(e.clientX - window.innerWidth / 2) / window.innerWidth * 2 * max

                body.velocity.x = velocity
            }
            let deviceOrientation = e => {
                let velocity = -e.gamma / 50 * max

                body.velocity.x = velocity
            }
            
            window.addEventListener("mousemove", mouseMove)

            if (hasDeviceOrientation) {
                window.addEventListener("deviceorientation", deviceOrientation)
            }

            return () => {
                window.removeEventListener("mousemove", mouseMove)
                window.removeEventListener("deviceorientation", deviceOrientation)
            }
        }
    }, [hasDeviceOrientation, state, body])

    // jump set on collision
    useEffect(() => {
        if (body && state === GameState.RUNNING) {
            body.addEventListener("collide", ({ body: target }) => {
                // if collieded body is below player,
                // we hit the "top" of the other body and can jump again
                let intersection = intersectBody(
                    body.position.toArray(),
                    [body.position.x, body.position.y - 10, body.position.z],
                    target
                )

                if (intersection.hasHit) {
                    actions.setBaseY(body.position.y)
                    setCanJump(true)
                }
            })
        }
    }, [body, state])

    // jump
    useEffect(() => {
        if (state === GameState.RUNNING) {
            let root = document.getElementById("root")
            let listener = (e) => {
                if (!canJump) {
                    return
                }

                if (hasDeviceOrientation) {
                    e.preventDefault()
                }

                // if there is nothing below the player
                // he must have fallen off the edge of the world
                let intersection = intersectBodies(
                    body.position.toArray(),
                    [body.position.x, body.position.y - 20, body.position.z],
                    world.bodies.filter(i => i !== body)
                )

                if (canJump && intersection.hasHit) {
                    body.velocity.y = 8
                    setCanJump(false)
                } else {
                    setCanJump(false)
                }
            }

            root.addEventListener("click", listener)
            root.addEventListener("touchstart", listener, { passive: !hasDeviceOrientation })

            return () => {
                root.removeEventListener("click", listener)
                root.removeEventListener("touchstart", listener, { passive: !hasDeviceOrientation })
            }
        }
    }, [body, state, canJump, hasDeviceOrientation])

    return (
        <mesh ref={ref} material={materials.white}>
            <sphereBufferGeometry attach="geometry" args={[radius, 16, 16]} /> 
        </mesh>
    )
}


function intersectBodies(from, to, bodies) {
    let result = new RaycastResult()
    let ray = new Ray(
        new Vec3(...from),
        new Vec3(...to)
    )

    ray.intersectBodies(bodies, result)

    return result
}

function intersectBody(from, to, body) {
    let result = new RaycastResult()
    let ray = new Ray(
        new Vec3(...from),
        new Vec3(...to)
    )

    ray.intersectBody(body, result)

    return result
}