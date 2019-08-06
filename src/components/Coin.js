
import React, { useState, useEffect, useRef } from "react"
import { Sphere, Vec3, Ray, RaycastResult } from "cannon"
import { useSelector } from "react-redux"
import { getState, getPlayerPosition } from "../store/selectors/run"
import { increaseScore } from "../store/actions/run"
import { useRender } from "react-three-fiber"
import { useThrottledRender, useActions } from "../utils/hooks"
import { Vector3 } from "three"
import GameState from "../const/GameState"
import { useWorld } from "../utils/cannon"
 
export default function Coin({ position = [0, 0, 0] }) { 
    let world = useWorld()
    let ref = useRef()
    let [resolvedY, setResolvedY] = useState(-100)
    let [picked, setPicked] = useState(false)
    let playerPosition = useSelector(getPlayerPosition)
    let state = useSelector(getState)
    let actions = useActions({ increaseScore }) 

    useEffect(() => {
        ref.current.rotation.y = Math.random()

        setTimeout(() => {
            let result = new RaycastResult()
            
            world.raycastClosest(
                new Vec3(...position),
                new Vec3(position[0], position[1] - 10, position[2]),
                {},
                result
            )  

            if (result.hasHit) {
                setResolvedY(result.hitPointWorld.y + .35 * 1.5 + .25) 
            } else {
                setPicked(true)
            }
        }, 50)
    }, [world])

    useThrottledRender(() => {
        if (!picked && state === GameState.ACTIVE) {
            let distance = new Vector3(position[0], resolvedY, position[2]).distanceToSquared(
                new Vector3(playerPosition.x, playerPosition.y, playerPosition.z)
            )

            if (distance < 1) { 
                setPicked(true)
                actions.increaseScore()
            }
        } 
    }, 200, [playerPosition, picked, resolvedY])

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
            <octahedronBufferGeometry attach="geometry" args={[.35, 0]} />
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
