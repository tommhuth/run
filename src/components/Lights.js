import React, { useEffect, useRef } from "react"
import { api } from "../data/store"

export default function Lights() {
    let ref = useRef()

    useEffect(() => {
        return api.subscribe((position) => {
            ref.current.position.z = position.z
            ref.current.position.y = position.y + 4
            ref.current.position.x = position.x
        }, state => state.data.position)
    }, [])

    return (
        <>
            <directionalLight
                color={0xffffff}
                position={[0, 0, 0]}
                intensity={.5}
                target-position={[-3, -3, 5]}
            />
            <ambientLight color={0x99eeff} intensity={.3} />
            <pointLight ref={ref} color={0xFFFF00} intensity={1} distance={10} />
        </>
    )
}