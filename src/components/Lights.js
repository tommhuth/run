
import React, { useEffect } from "react" 
import  { useSelector } from "react-redux" 
import { useThree } from "react-three-fiber" 
import Config from "../Config" 
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
                color={0xFFFFFF} 
                intensity={.2} 
            /> 
            <directionalLight 
                color={0xFFFFFF} 
                castShadow={false} 
                intensity={1}
                position={[-3, 7, playerPosition.z - 5]} 
                target-position={[0,0, playerPosition.z]}  
                onUpdate={self => { 
                    self.target.updateMatrixWorld() 
                    self.shadow.mapSize.width = 512 * 2
                    self.shadow.mapSize.height = 512 * 2
                    self.shadow.camera.near = 5
                    self.shadow.camera.far = 35
                    self.shadow.camera.left = -15
                    self.shadow.camera.right = 15
                    self.shadow.camera.top = 15
                    self.shadow.camera.bottom = -15
                }}
            />
        </>
    )
}
