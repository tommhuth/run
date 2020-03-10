import React, { useEffect, useRef} from "react"

export default function Cylinder({
    position = [],
    material,
    radius = 1, 
    height = 1, 
    segments = 8
}){ 
    let ref = useRef()

    useEffect(()=>{
        () => ref.current.dispose()
    }, [])

    return ( 
        <mesh 
            position={position}
            material={material} 
        >
            <cylinderBufferGeometry ref={ref} attach="geometry" args={[radius, radius, height, segments]} />
        </mesh>
    )
}