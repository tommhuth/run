import React, { useEffect, useRef } from "react" 

export default function Lights() { 
    return (
        <>
            <directionalLight 
                color={0xff0000}
                position={[3, 5, -10]} 
                intensity={2}
                onUpdate={self => {
                    self.updateMatrixWorld()
                }}
            />
            <hemisphereLight groundColor="red" color="blue" intensity={1} />
        </>
    )
}