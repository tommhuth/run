import { useEffect, useRef, useState } from "react"
import { useFrame } from "react-three-fiber"
import { useStore } from "../../data/store"
import { useCannon } from "../../data/cannon"
import Config from "../../Config"
import { Sphere, RaycastResult, Ray, Vec3 } from "cannon-es"
import GameState from "../../data/const/GameState"
import materials from "../../shared/materials"
import geometry from "../../shared/geometry"

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
        customData: { actor: "player" },
        position: [...Config.PLAYER_START],
        onCollide({ body: target }) {
            // if other body is below player,
            // we hit the "top" of the other body and can jump again  
            for (let z of [body.position.z, body.position.z + radius]) {
                let intersection = intersectBody(
                    body.position.toArray(),
                    [body.position.x, body.position.y - 20, z],
                    target
                )

                if (intersection.hasHit || intersection.hasHit) {
                    setCanJump(true)
                    break
                }
            }
        }
    }, [canJump])
    let speed = 8
    let setPosition = useStore(i => i.setPosition)
    let end = useStore(i => i.end)
    let state = useStore(i => i.state)
    let lastBlock = useStore(i => {
        return i.blocks.reduce((min, curr) => Math.min(min, curr.y), i.blocks[i.blocks.length - 1].y)
    })
    let hasDeviceOrientation = useStore(i => i.hasDeviceOrientation)
    let speedHistory = useRef([])
    let [ready, setReady] = useState(false)

    useEffect(() => {
        if (state === GameState.RUNNING) {
            setTimeout(() => setReady(true), 500)
        }
    }, [state])

    useFrame(() => {
        let size = 5

        speedHistory.current = [...speedHistory.current.slice(-size), body.velocity.z]
    })

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

            document.body.addEventListener("click", jump)
            document.body.addEventListener("touchstart", jump, { passive: false })

            return () => {
                document.body.removeEventListener("click", jump)
                document.body.removeEventListener("touchstart", jump, { passive: false })
            }
        }
    }, [state, canJump])

    // game over
    useFrame(() => {
        if (state === GameState.RUNNING) {
            let offsideBuffer = Config.BLOCK_MAX_EXTRA_WIDTH / 2
            let x = body.position.x
            let offside = x < -(Config.BLOCK_WIDTH / 2 + offsideBuffer) || x > Config.BLOCK_WIDTH / 2 + offsideBuffer
            let y = body.position.y
            let low = y + 1 < lastBlock
            let minSpeed = 1
            let stalled = speedHistory.current.reduce(
                (accumulator, value) => accumulator + value,
                0
            ) / speedHistory.current.length < minSpeed

            if ((stalled && ready) || low || offside) {
                end(stalled && ready ? "Crashed" : "Fell off")
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
        <mesh
            ref={ref}
            material={materials.player}
            geometry={geometry.sphere}
        />
    )
}