import React, { useEffect, useRef } from "react" 

export default function Lights() { 
    return (
        <>
            <directionalLight 
                color={0xffffff}
                position={[0, 5, 20]} 
                intensity={.8}
                onUpdate={self => {
                    self.updateMatrixWorld()
                }}
            />
            <hemisphereLight groundColor="red" color="blue" intensity={1} />
        </>
    )
}