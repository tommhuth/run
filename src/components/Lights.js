import React, { useEffect, useRef } from "react"
import { api, useStore } from "../data/store"
import GameState from "../data/const/GameState"

export default function Lights() {
    let ref = useRef()
    let ref2 = useRef()
    let state = useStore(state => state.data.state)

    useEffect(() => {
        return api.subscribe((position) => {
            if (!ref.current) {
                return
            }

            ref.current.position.z = position.z
            ref.current.position.y = position.y + 4
            ref.current.position.x = position.x 

            ref2.current.position.z = position.z
            ref2.current.position.y += (position.y + 8 - ref2.current.position.y   ) * .1
            ref2.current.position.x = position.x
        }, state => state.data.position)
    }, [])

    return (
        <>     
            <ambientLight color={0x99eeff} intensity={.3} />
            <pointLight ref={ref} color={0xFFFF00} decay={1} intensity={1} distance={8} />
            <pointLight ref={ref2} color={0x00ffff} decay={1.1} intensity={1.15} distance={18} />
        </>
    )
}

/*
               
            <directionalLight
                color={0xffffff}
                position={[-1, 5, -3]}
                intensity={.5} 
                onUpdate={self => self.updateMatrixWorld()}
            />

            <ambientLight color={0x99eeff} intensity={.3} />
            <pointLight ref={ref} color={0xFFFF00} decay={1.35} intensity={1.35} distance={8} />
            <pointLight ref={ref2} color={0x00ffff} decay={2} intensity={1.75} distance={18} />


            ref2.current.position.z = position.z
            ref2.current.position.y += (position.y + 8 - ref2.current.position.y   ) * .1
            ref2.current.position.x = position.x
*/