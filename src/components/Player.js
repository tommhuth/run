
import React, { useState, useEffect } from "react"
import { Sphere, Vec3, Ray, RaycastResult } from "cannon"
import { useSelector } from "react-redux"
import { useCannon } from "../utils/cannon"
import { getState } from "../store/selectors/run"
import Config from "../Config"
import { setPlayerPosition, gameOver } from "../store/actions/run"
import { useRender } from "react-three-fiber"
import { useThrottledRender, useActions } from "../utils/hooks"
import { throttle } from "throttle-debounce"
import GameState from "../const/GameState"

let prev = 0

export default function Player({ position = [0, 5, 2] }) {
    let [body, setBody] = useState(null)
    let [world, setWorld] = useState(null)
    let [canJump, setCanJump] = useState(false)
    let actions = useActions({ setPlayerPosition, gameOver })
    let state = useSelector(getState)

    const ref = useCannon(
        { mass: .5 },
        (body, world) => {
            body.addShape(new Sphere(.5))
            body.position.set(...position)

            setBody(body)
            setWorld(world)
        }
    )

    // fallen off world = no jump
    useThrottledRender(() => {
        let ray = new Ray(
            body.position.clone(),
            new Vec3(body.position.x, body.position.y - 10, body.position.z)
        )
        ray.intersectBodies(world.bodies.filter(i => i !== body), new RaycastResult())

        if (!ray.hasHit) {
            setCanJump(false)
        }
    }, 300, [body, world, state])

    // update redux pos every 1s
    useThrottledRender(() => {
        if (state === GameState.ACTIVE) { 
            actions.setPlayerPosition({
                x: body.position.x,
                y: body.position.y,
                z: body.position.z
            })
        }
    }, 1000, [body, state])

    // if player collide and body is beneath = can jump again
    useEffect(() => {
        if (body && state === GameState.ACTIVE) {
            let listener = ({ body: target }) => {
                let ray = new Ray(
                    body.position.clone(),
                    new Vec3(body.position.x, body.position.y - 10, body.position.z)
                )

                ray.intersectBody(target, new RaycastResult())

                if (ray.hasHit) {
                    setCanJump(true)
                }
            }

            body.addEventListener("collide", listener)

            return () => body.removeEventListener("collide", listener)
        }
    }, [body, state])

    // do jump logic
    useEffect(() => {
        let listener = () => {
            if (body && canJump && state === GameState.ACTIVE) {
                setCanJump(false)
                body.applyImpulse(new Vec3(0, 4, 0), body.position)
            }
        }

        window.addEventListener("click", listener)

        return () => window.removeEventListener("click", listener)
    }, [body, canJump, state])

    // move player forwad
    useRender(() => {
        if (body) {
            if (state === GameState.ACTIVE) {
                if (body.velocity.z < 2 && body.x) { 
                    actions.gameOver()
                } else {
                    body.velocity.z = Math.max(Config.PLAYER_SPEED, body.velocity.z)
                    body.x = true
                }
            }
        }
    }, false, [body, state])

    useEffect(() => {
        if (body && state === GameState.ACTIVE) {
            body.position.set(...position)

            let deviceOrientation = throttle(0, false, (e) => {
                let rotation = (e.gamma / 90 * -2) - prev
                let limit = 100

                if (e.beta >= 90) {
                    // if tilted towards user, gamma is flipped - flip back
                    rotation *= -1
                }

                if (rotation > 0 && rotation > limit) {
                    rotation = limit
                }

                if (rotation < 0 && rotation < -limit) {
                    rotation = -limit
                }

                body.applyForce(new Vec3(rotation * 10, 0, 0), body.position)

                prev = rotation
            })
            let mouseMove = (e) => {
                let offset = ((window.innerWidth / 2 - e.pageX) / window.innerWidth / 2 * 2) - prev

                body.applyForce(new Vec3(offset * 25, 0, 0), body.position)

                prev = offset
            }

            window.addEventListener("deviceorientation", deviceOrientation)
            window.addEventListener("mousemove", mouseMove)

            return () => {
                window.removeEventListener("deviceorientation", deviceOrientation)
                window.removeEventListener("mousemove", mouseMove)
            }
        }

    }, [body, state])

    useRender(() => {
        if (body && state === GameState.ACTIVE) {
            if (body.position.y < -6 || body.position.x < -15 || body.position.x > 15) { 
                actions.gameOver()
            }
        }
    }, false, [body, state])

    useEffect(() => {
        if (body && state === GameState.ACTIVE) {
            body.velocity.set(0, 0, 0)
            prev = 0
            body.x = false
        }
    }, [body, state])

    return (
        <mesh ref={ref} key={"player"} receiveShadow castShadow>
            <sphereBufferGeometry attach="geometry" args={[.5, 24, 24]} />
            <meshPhongMaterial dithering color={0x0000FF} attach="material" />
        </mesh>
    )
}
