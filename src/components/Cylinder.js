import React from "react"

export default function Cylinder({
    position = [],
    material,
    radius = 1, 
    height = 1, 
    segments = 8
}){ 
    return ( 
        <mesh 
            position={position}
            material={material} 
        >
            <cylinderBufferGeometry attach="geometry" args={[radius, radius, height, segments]} />
        </mesh>
    )
}