import React, { useEffect, createRef, useState } from "react"
import { useSelector } from "react-redux"
import { useThree, useRender } from "react-three-fiber"
import Config from "../Config"
import { getState } from "../store/selectors/run"
import GameState from "../const/GameState"

export default function Camera() {
    let ref = createRef()
    let { setDefaultCamera } = useThree()
    let [z, setZ] = useState(0)
    let state = useSelector(getState) 

    useEffect(() => {
        ref.current.lookAt(0, 0, 0)
    }, [])
    useEffect(() => {
        if (state === GameState.ACTIVE) {
            setZ(0)
        }
    }, [state])

    useRender(() => {
        if (state === GameState.ACTIVE) {
            setZ(prev => prev + (Config.PLAYER_SPEED / 30))
        }
    }, false, [state])

    return (
        <perspectiveCamera
            far={75}
            position={[0, 5, -15 + z]}
            ref={ref}
            onUpdate={self => {
                setDefaultCamera(self)
            }}
        />
    )
}
