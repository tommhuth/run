
import React, { useState, useEffect } from "react"
import { Sphere, Vec3, Ray, RaycastResult } from "cannon" 
import { useCannon } from "../utils/cannon"
import Config from "../Config"
import { setPlayerPosition } from "../store/actions/run" 
import { useRender } from "react-three-fiber"
import { useThrottledRender, useActions } from "../utils/hooks"

export default function Player({ position = [0, 4, 2] }) {
    let [body, setBody] = useState(null)
    let [world, setWorld] = useState(null)
    let [canJump, setCanJump] = useState(false)
    let actions = useActions({ setPlayerPosition })

    const ref = useCannon(
        { mass: .5 },
        (body, world) => {
            body.addShape(new Sphere(.5))
            body.position.set(...position)

            setBody(body)
            setWorld(world)

            world.addEventListener
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
    }, 300, [body, world])

    // update redux pos every 1s
    useThrottledRender(() => {
        actions.setPlayerPosition({
            x: body.position.x,
            y: body.position.y,
            z: body.position.z
        })
    }, 1000, [body])

    // if player collide and body is beneath = can jump again
    useEffect(() => {
        if (body) {
            let listener = ({ body: target }) => {
                let ray = new Ray(
                    body.position.clone(),
                    new Vec3(body.position.x, body.position.y - 10, body.position.z)
                )

                ray.intersectBody(target, new RaycastResult())

                setCanJump(ray.hasHit)
            }

            body.addEventListener("collide", listener)

            return () => body.removeEventListener("collide", listener)
        }
    }, [body])

    // do jump logic
    useEffect(() => {
        let listener = () => {
            if (body && canJump) {
                setCanJump(false)
                body.applyImpulse(new Vec3(0, 4, 0), body.position)
            }
        }

        window.addEventListener("click", listener)

        return () => window.removeEventListener("click", listener)
    }, [body, canJump])

    // move player forwad
    useRender(() => {
        if (body) {
            body.velocity.z = Math.max(Config.PLAYER_SPEED, body.velocity.z)
        }
    }, false, [body])

    return (
        <mesh ref={ref} key={"player"}>
            <sphereBufferGeometry attach="geometry" args={[.5, 24, 24]} />
            <meshPhongMaterial dithering color={0x0000FF} attach="material" />
        </mesh>
    )
}
