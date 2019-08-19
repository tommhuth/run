import React, { useEffect, createRef, useState } from "react"
import { useSelector } from "react-redux"
import { useThree, useRender } from "react-three-fiber"
import { getState } from "../store/selectors/run"
import GameState from "../const/GameState"
import { useWorld, getPlayer } from "../utils/cannon"

export default function Camera() {
    let ref = createRef()
    let { setDefaultCamera } = useThree()
    //let [z, setZ] = useState(0) 
    let [x] = useState(0)
    let world = useWorld(0)
    let state = useSelector(getState)

    useEffect(() => {
        ref.current.position.set(0, 5, -6)
        ref.current.lookAt(0, 0, 4)
    }, [ref.current])

    useEffect(() => {
        if (state === GameState.ACTIVE) {
            //ref.current.position.z = 0
        }
    }, [state])

    useRender(() => {
        if (state === GameState.ACTIVE) {
            let player = getPlayer(world)

            if (player) {
                //setZ(player.position.z)
                ref.current.position.z = player.position.z - 6 
                //setX(prev => prev + (( player.position.x - prev) / 35))
            }

        }
    }, false, [state, world])

    return (
        <perspectiveCamera
            far={75}
            
            ref={ref}
            onUpdate={self => {
                setDefaultCamera(self) 
            }}
        />
    )
}
