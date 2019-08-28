import React, { useEffect, createRef, useState } from "react"
import { useSelector } from "react-redux"
import { useThree, useRender } from "react-three-fiber"
import { getState } from "../store/selectors/run"
import GameState from "../const/GameState"
import { useWorld, getPlayer } from "../utils/cannon"
import random from "../utils/random"

export default function Camera() {
    let ref = createRef()
    let { setDefaultCamera } = useThree()
    let [trauma, setTrauma] = useState(0)
    let [rotation, setRot] = useState({ x: 0, y: 0, z: 0 })  
    let world = useWorld(0)
    let state = useSelector(getState)

    useEffect(() => {
        //window.addEventListener("click", () => setTrauma(prev => prev + .3))
    }, [])

    useEffect(() => {
        ref.current.position.set(0, 5, -8)
        ref.current.lookAt(0, 0, 4)
        
        setRot({
            x: ref.current.rotation.x,
            y: ref.current.rotation.y,
            z: ref.current.rotation.z
        })
    }, [ref.current])

    useEffect(() => {
        if (state === GameState.ACTIVE) {
            //ref.current.position.z = 0
        }
    }, [state])

    useRender(() => {
        if (state === GameState.ACTIVE) {
            let player = getPlayer(world)

            if (player && ref.current) { 
                ref.current.position.z = player.position.z - 8
                ref.current.position.x += (player.position.x/2 - ref.current.position.x) * .25 
            }
        }

        let dec = .01 

        if (trauma - dec > 0) {
            setTrauma(prev => prev - dec)
        } else if (trauma > 0) {
            setTrauma(0)
        }
    }, false, [state, world, trauma, ref]) 

    return (
        <perspectiveCamera
            far={75}
            ref={ref}
            rotation-x={rotation.x + (.2 * trauma * trauma*random.real(-1, 1))}
            rotation-y={rotation.y + (.2 * trauma * trauma*random.real(-1, 1))}
            rotation-z={rotation.z + (.2 *trauma *trauma * random.real(-1, 1))}
            onUpdate={self => {
                setDefaultCamera(self)
            }}
        />
    )
}
