import React, { useEffect, createRef, useState } from "react"
import { useSelector } from "react-redux"
import { useThree, useRender } from "react-three-fiber" 
import { getState } from "../store/selectors/run"
import GameState from "../const/GameState"
import { useWorld } from "../utils/cannon"

export default function Camera() {
    let ref = createRef()
    let { setDefaultCamera } = useThree()
    let [z, setZ] = useState(0)
    let world = useWorld(0)
    let state = useSelector(getState) 
 
    useEffect(() => {
        ref.current.lookAt(0, 0, 4)
    }, [])

    useEffect(() => {
        if (state === GameState.ACTIVE) {
            setZ(0)
        }
    }, [state])

    useRender(() => {
        if (state === GameState.ACTIVE) {
            let z = world.bodies.find(i => i.xname === "player").position.z

            setZ(z)
        }
    }, false, [state, world])

    return (
        <perspectiveCamera
            far={75}
            position={[0, 8, -12 + z]}
            ref={ref}
            onUpdate={self => {
                setDefaultCamera(self)
            }}
        />
    )
}
