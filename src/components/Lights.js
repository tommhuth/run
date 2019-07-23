
import React, { useEffect } from "react" 
import { useThree } from "react-three-fiber" 
import Config from "../Config" 
 
export default function Lights() {
    const { gl } = useThree() 

    return (
        <>
            <ambientLight 
                color={0xFFFFFF} 
                intensity={.2} 
            /> 
            <directionalLight 
                color={0xFFFFFF} 
                position={[0, 0, 0]}
                intensity={1}
                target-position={[-6, -7, 5]} 
                onUpdate={self => {
                    self.target.updateMatrixWorld() 
                }}
            />
        </>
    )
}
