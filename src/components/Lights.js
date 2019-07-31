
import React, { useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { useThree } from "react-three-fiber"
import Config from "../Config"
import { getPlayerPosition } from "../store/selectors/run"

export default function Lights() {
    let { gl } = useThree()
    let playerPosition = useSelector(getPlayerPosition)

    useEffect(() => {
        gl.shadowMap.enabled = true

        /* 
        self.shadow.mapSize.width = 512 * 2
        self.shadow.mapSize.height = 512 * 2
        self.shadow.camera.near = 5
        self.shadow.camera.far = 35
        self.shadow.camera.left = -15
        self.shadow.camera.right = 15
        self.shadow.camera.top = 15
        self.shadow.camera.bottom = -15
        */
    }, [])

    return (
        <>
            <ambientLight
                color={0xFFFFFF}
                intensity={.1}
            />
            <directionalLight
                color={0xFFFFFF}
                castShadow={false}
                intensity={1}
                position={[0, 0, playerPosition.z]}
                target-position={[3, -10, playerPosition.z + 1]}
                onUpdate={(self) => self.target.updateMatrixWorld()}
            />
        </>
    )
}
