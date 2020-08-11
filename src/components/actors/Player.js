
import React, { useEffect, useRef, useState } from "react"
import { useThree, useFrame } from "react-three-fiber"
import Block from "../Block"
import { useStore } from "../../data/store"
import { useCannon } from "../../data/cannon"
import Config from "../../Config"
import { Sphere } from "cannon"
import GameState from "../../data/const/GameState"
import materials from "../../shared/materials"

export default function Player() {
    let radius = 1
    let { ref, body } = useCannon({
        mass: 2,
        shape: new Sphere(radius),
        position: [0, radius * 20, Config.Z_START]
    })
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
            let onClick = (e) => {
                e.preventDefault()
                body.velocity.y = 8
            }

            window.addEventListener("click", onClick)
            window.addEventListener("touchstart", onClick, { passive: false })

            return () => {
                window.removeEventListener("click", onClick)
                window.removeEventListener("touchstart", onClick, { passive: false })
            }
        }
    }, [state])

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

            setPosition(body.position.x, body.position.y, body.position.z)
        }
    })

    return (
        <mesh ref={ref} material={materials.player}> 
            <sphereBufferGeometry attach="geometry" args={[radius, 12, 6]} />
        </mesh>
    )
}