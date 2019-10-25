import React, { useEffect, useRef } from "react" 

export default function Lights() { 
    let ref = useRef()

    useEffect(() => { 
        ref.current.target.updateMatrixWorld()
    }, [ref.current])

    return (
        <>
            <ambientLight
                color={0xFFFFFF}
                intensity={.5}
            />
            <directionalLight
                ref={ref}
                color={0xFFFFFF}
                position={[0, 5, 0]}
                intensity={.5}
                target-position={[3, -5, 5]} 
            /> 
        </>
    )
}