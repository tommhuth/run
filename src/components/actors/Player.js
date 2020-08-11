
import React, { useEffect, useRef, useState } from "react"
import { useThree, useFrame } from "react-three-fiber" 
import { useStore } from "../../data/store"
import { useCannon } from "../../data/cannon"
import Config from "../../Config"
import { Sphere,RaycastResult,Ray,Vec3 } from "cannon"
import GameState from "../../data/const/GameState"
import materials from "../../shared/materials"


function intersectBody(from, to, body) {
    let result = new RaycastResult()
    let ray = new Ray(
        new Vec3(...from),
        new Vec3(...to)
    )

    ray.intersectBody(body, result)

    return result
}

export default function Player() {
    let radius = 1
    let [canJump, setCanJump] = useState(false)
    let { ref, body } = useCannon({
        mass: 2,
        shape: new Sphere(radius),
        position: [0, radius * 20, Config.Z_START],
        onCollide({ body: target }) {
            // if other body is below player,
            // we hit the "top" of the other body and can jump again
            let intersection = intersectBody(
                body.position.toArray(),
                [body.position.x, body.position.y - 20, body.position.z],
                target
            )

            if (intersection.hasHit) {
                setCanJump(true)
            }
        }
    }, [canJump])
    let speed = 6
    let setPosition = useStore(i => i.setPosition)
    let end = useStore(i => i.end)
    let state = useStore(i => i.state)
    let lastBlock = useStore(i => i.blocks[i.blocks.length - 1])
    let hasDeviceOrientation = useStore(i => i.hasDeviceOrientation)

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
        if (state === GameState.RUNNING) {
            let jump = (e) => {
                e.preventDefault()

                if (canJump) {
                    body.velocity.y = 8 
                    setCanJump(false)
                }
            }

            window.addEventListener("click", jump)
            window.addEventListener("touchstart", jump, { passive: false })

            return () => {
                window.removeEventListener("click", jump)
                window.removeEventListener("touchstart", jump, { passive: false })
            }
        }
    }, [state, canJump])

    // game over
    useFrame(() => {
        if (state === GameState.RUNNING) {
            let buffer = Config.BLOCK_MAX_EXTRA_WIDTH / 2
            let x = body.position.x
            let y = body.position.y
            let low = y + 1 < lastBlock.y

            if (low || x < -(Config.BLOCK_WIDTH / 2 + buffer) || x > Config.BLOCK_WIDTH / 2 + buffer) {
                end()
            }
        }
    })

    useFrame(() => {
        if (state === GameState.RUNNING) {
            body.velocity.z = speed 
        }

        setPosition(body.position.x, body.position.y, body.position.z)
    })

    return (
        <mesh ref={ref} material={materials.player}> 
            <sphereBufferGeometry attach="geometry" args={[radius, 12, 6]} />
        </mesh>
    )
}