import React, { useEffect, createRef, useState } from "react"
import { useSelector } from "react-redux"
import { useThree, useRender } from "react-three-fiber"
import Config from "../Config"
import { getState, getPlayerPosition } from "../store/selectors/run"
import GameState from "../const/GameState"

export default function Camera() {
    let ref = createRef()
    let { setDefaultCamera } = useThree()
    let [z, setZ] = useState(0)
    let state = useSelector(getState)
    let { forwardVelocity = Config.PLAYER_SPEED } = useSelector(getPlayerPosition)
 
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
            setZ(prev => prev + (forwardVelocity / 30))
        }
    }, false, [state, forwardVelocity])

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
