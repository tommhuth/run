import React, { useEffect, useRef } from "react" 
import Config from "../Config"

export default function Lights() { 
    return (
        <>
            <directionalLight 
                color={0xff0000}
                position={[3, 5, -10]} 
                intensity={5}
                onUpdate={self => {
                    self.updateMatrixWorld()
                }}
            />
            <hemisphereLight groundColor="red" color="blue" intensity={Config.DO_FULL_POST_PROCESSING ? 1 : 2} />
        </>
    )
}