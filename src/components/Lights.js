
import { useThree } from "react-three-fiber"
import React, { useEffect, useRef } from "react"
import { api } from "../data/store"
import shallow from "zustand/shallow"

export default function Lights() {
    let lightRef = useRef()
    let { scene } = useThree()

    useEffect(() => {
        scene.add(lightRef.current.target)

        lightRef.current.position.y = 0
        lightRef.current.target.position.y = -8
        lightRef.current.updateMatrixWorld()

        return api.subscribe(
            ([position, lastBlock]) => {
                if (lightRef.current && Math.round(position.z) % 3 === 0) {
                    lightRef.current.position.z = position.z
                    lightRef.current.position.y = lastBlock.y
                    lightRef.current.target.position.z = position.z - 20
                    lightRef.current.target.position.y = lastBlock.y - 8
                    lightRef.current.updateMatrixWorld()
                }
            },
            store => [store.position, store.blocks[store.blocks.length - 1]],
            shallow
        )
    }, [])

    return (
        <>
            <directionalLight
                ref={lightRef}
                color={0xffffff}
                position={[0, 0, 0]}
                target-position={[0, 0, -20]}
                intensity={.65}
                onUpdate={self => {
                    self.updateMatrixWorld()
                }}
            />
            <hemisphereLight groundColor={"red"} color="blue" intensity={1} />
        </>
    )
}