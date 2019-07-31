
import React, { useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { useThree } from "react-three-fiber" 
import { getPlayerPosition } from "../store/selectors/run"

export default function Lights() {
    let { gl } = useThree()
    let playerPosition = useSelector(getPlayerPosition)

    useEffect(() => {
        gl.shadowMap.enabled = true
    }, [])

    return (
        <>
            <ambientLight
                color={0x6666FF}
                intensity={.1}
            />
            <directionalLight
                color={0xFFFFFF}
                castShadow={true}
                intensity={1}
                position={[0, 0, playerPosition.z]}
                target-position={[3, -10, playerPosition.z + 1]}
                onUpdate={(self) => {
                    self.target.updateMatrixWorld()
                    self.shadow.mapSize.width = 512 * 2
                    self.shadow.mapSize.height = 512 * 2
                    self.shadow.camera.near = -10
                    self.shadow.camera.far = 10
                    self.shadow.camera.left = -30
                    self.shadow.camera.right = 30
                    self.shadow.camera.top = 10
                    self.shadow.camera.bottom = -20
                }}
            />
        </>
    )
}
