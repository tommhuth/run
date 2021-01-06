import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { api } from "../data/store"
import { useThree } from "react-three-fiber"

export default function Lights() {
    let ref = useRef()
    let { scene } = useThree() 
    let [z, setZ] = useState(0)

    useLayoutEffect(() => {
        ref.current.shadow.camera.near = -75
        ref.current.shadow.camera.far = 75
        ref.current.shadow.camera.left = -75
        ref.current.shadow.camera.right = 75
        ref.current.shadow.camera.top = 75
        ref.current.shadow.camera.bottom = -75

        ref.current.target.position.set(-3, -7, 9)
        scene.add(ref.current.target) 
    }, [])

    useEffect(() => { 
        return api.subscribe(i => {
            setZ(Math.floor(i.z))
        }, i => i.position)
    }, []) 

    useEffect(() => {
        ref.current.position.z = z
        ref.current.target.position.z = z + 15   
    }, [Math.floor(z / 10)])

    return (
        <>
            <directionalLight
                ref={ref}
                color={0xaaaaff}
                position={[0, 0, 0]}
                intensity={.31}
                castShadow
                onUpdate={self => {
                    self.updateMatrixWorld()
                }}
            />
            <hemisphereLight groundColor="red" color="blue" intensity={.9} />
        </>
    )
}