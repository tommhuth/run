
import React, { useState, useEffect, useRef } from "react"
import { Vec3, RaycastResult } from "cannon"
import { useSelector } from "react-redux"
import { getState } from "../store/selectors/run"
import { increaseScore } from "../store/actions/run"
import { useRender } from "react-three-fiber"
import { useThrottledRender, useActions } from "../utils/hooks"
import { Vector3 } from "three"
import GameState from "../const/GameState"
import { useWorld, getPlayer } from "../utils/cannon"

export default function Coin({ position = [0, 0, 0] }) {
    let world = useWorld()
    let ref = useRef()
    let [resolvedY, setResolvedY] = useState(-100)
    let [picked, setPicked] = useState(false) 
    let [radius] = useState(.15) 
    let state = useSelector(getState)
    let actions = useActions({ increaseScore })

    useEffect(() => {
        ref.current.rotation.y = Math.random()

        setTimeout(() => {
            let result = new RaycastResult()

            world.raycastClosest(
                new Vec3(position[0], position[1] + 10, position[2]),
                new Vec3(position[0], position[1] - 10, position[2]),
                {},
                result
            )

            if (result.hasHit) { 
                setResolvedY(result.hitPointWorld.y + radius * 1.5 + .1)
            } else {
                setPicked(true)
            }
        }, 110)
    }, [])

    useThrottledRender(() => {
        let player = getPlayer(world)

        if (player && !picked && state === GameState.ACTIVE) {
            let distance = new Vector3(position[0], resolvedY, position[2])
                .distanceToSquared(
                    new Vector3(player.position.x, player.position.y, player.position.z)
                )

            if (distance <= 1) {
                actions.increaseScore()
                setPicked(true)
            }
        }
    }, 100, [world, picked, resolvedY, state], true)

    useRender(() => {
        if (!picked && ref.current) {
            ref.current.rotation.y += .02
        }
    })

    if (picked) {
        return null
    }

    return (
        <mesh
            receiveShadow
            castShadow
            ref={ref}
            position={[position[0], resolvedY, position[2]]}
            scale-y={1.5}
        >
            <octahedronBufferGeometry attach="geometry" args={[radius, 0]} />
            <meshPhongMaterial
                dithering
                color={0x0055FF}
                emissive={0x0055FF}
                emissiveIntensity={.3}
                attach="material"
            />
        </mesh>
    )
}
