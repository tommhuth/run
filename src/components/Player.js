
import React, { useState, useEffect } from "react"
import { Sphere, Vec3, Ray, RaycastResult } from "cannon"
import { useSelector } from "react-redux"
import { useCannon, useWorld } from "../utils/cannon"
import { getState } from "../store/selectors/run"
import Config from "../Config"
import { gameOver } from "../store/actions/run"
import { useRender } from "react-three-fiber"
import { useThrottledRender, useActions } from "../utils/hooks"
import GameState from "../const/GameState"

export default function Player({ position = [0, 4, 0] }) {
    let [body, setBody] = useState(null)
    let [hasInitialVelocity, setHasInitialVelocity] = useState(false)
    let world = useWorld()
    let [canJump, setCanJump] = useState(false)
    let actions = useActions({ gameOver })
    let state = useSelector(getState)

    const ref = useCannon(
        { mass: 2 },
        (body) => {
            body.addShape(new Sphere(.5))
            body.position.set(...position)
            body.userData = { type: "player" }

            setBody(body)
        }
    )

    // fallen off world = no jump
    useThrottledRender(() => {
        if (state === GameState.ACTIVE) {
            let ray = new Ray(
                body.position.clone(),
                new Vec3(body.position.x, body.position.y - 10, body.position.z)
            )
            ray.intersectBodies(world.bodies.filter(i => i !== body), new RaycastResult())

            if (!ray.hasHit) {
                setCanJump(false)
            }
        }
    }, 300, [body, world, state])


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

    // do jump  
    useEffect(() => {
        let listener = (e) => {
            e.preventDefault()

            if (body && canJump && state === GameState.ACTIVE) {
                body.velocity.y = 9
                setCanJump(false)
            }
        }

        window.addEventListener("touchstart", listener)
        window.addEventListener("click", listener)

        return () => {
            window.removeEventListener("touchstart", listener)
            window.removeEventListener("click", listener)
        }
    }, [body, canJump, state])

    // move player forwad
    useRender(() => {
        if (body && state === GameState.ACTIVE) {
            if (body.velocity.z < .1 && hasInitialVelocity) {
                actions.gameOver()
            } else {
                body.velocity.z = Math.max(Config.PLAYER_SPEED, body.velocity.z)

                if (!hasInitialVelocity) {
                    setHasInitialVelocity(true)
                }
            }
        }
    }, false, [body, state, hasInitialVelocity])

    // control x axis movement
    useEffect(() => {
        if (body && state === GameState.ACTIVE) {
            body.position.set(...position)

            let deviceOrientation = (e) => {
                let rotation = (e.gamma / 90 * -1) * 5

                if (e.beta >= 90) {
                    // if tilted towards user, gamma is flipped - flip back
                    rotation *= -1
                }

                body.velocity.x = rotation
            }
            let mouseMove = (e) => {
                let rotation = ((window.innerWidth / 2 - e.pageX) / window.innerWidth / 2 * 2) * 10

                body.velocity.x = rotation
            }

            window.addEventListener("deviceorientation", deviceOrientation)
            window.addEventListener("mousemove", mouseMove)

            return () => {
                window.removeEventListener("deviceorientation", deviceOrientation)
                window.removeEventListener("mousemove", mouseMove)
            }
        }

    }, [body, state])

    // out of bounds check
    useRender(() => {
        if (body && state === GameState.ACTIVE) {
            if (body.position.y < -15 || body.position.x < -10 || body.position.x > 10) {
                actions.gameOver()
            }
        }
    }, false, [body, state])

    // reset
    useEffect(() => {
        if (body && state === GameState.ACTIVE) {
            body.velocity.set(0, 0, 0)
            body.angularVelocity.set(0, 0, 0)
            setHasInitialVelocity(false)
        }
    }, [body, state])

    return (
        <mesh ref={ref} receiveShadow castShadow>
            <sphereBufferGeometry attach="geometry" args={[.5, 24, 24]} />
            <meshPhongMaterial dithering color={0x0000FF} attach="material" />
        </mesh>
    )
}
