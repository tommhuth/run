import React, { useEffect, useRef } from "react"
import { api, useStore } from "../data/store"
import GameState from "../data/const/GameState"

export default function Lights() {
    let ref = useRef()
    let state = useStore(state => state.data.state)

    useEffect(() => {
        return api.subscribe((position) => {
            if (!ref.current) {
                return
            }

            ref.current.position.z = position.z
            ref.current.position.y = position.y + 4
            ref.current.position.x = position.x
        }, state => state.data.position)
    }, [])

    return (
        <>
            <directionalLight
                color={0xffffff}
                position={[-1, 5, -3]}
                intensity={.5} 
                onUpdate={self => self.updateMatrixWorld()}
            />
            <ambientLight color={0x99eeff} intensity={.3} />
            {[ GameState.RUNNING, GameState.GAME_OVER].includes(state) ? <pointLight ref={ref} color={0xFFFF00} intensity={1} distance={10} /> : null}
            
        </>
    )
}