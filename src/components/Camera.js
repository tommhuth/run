import React, { useEffect, createRef, useState } from "react"
import { useThree, useRender } from "react-three-fiber"
import { Vector3, Fog } from "three"
import Config from "../Config"

export default function Camera() {
    const ref = createRef()
    const { setDefaultCamera } = useThree()
    const [z, setZ] = useState(0)

    useEffect(() => {
        ref.current.lookAt(0, 0, 0)
    }, [])

    useRender(() => {
        setZ(prev => prev + (Config.PLAYER_SPEED / 30))
    }, false)

    return (
        <>
            <perspectiveCamera
                far={75}
                position={[0, 5, -10 + z]}
                ref={ref}
                onUpdate={self => {
                    setDefaultCamera(self)
                }}
            />
        </>
    )
}
