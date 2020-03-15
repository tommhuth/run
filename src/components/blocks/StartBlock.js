import React, { useState } from "react"
import { material, geometry } from "../../data/resources"

export default function StartBlock({
    depth,
    start,
    y
}) {
    return (
        <>
            <mesh
                position={[25, 0, 45]}
                material={material.blue}
                geometry={geometry.sphere}
                rotation-x={.2}
                scale={[9, 9, 9]}
            />

            
            <mesh
                position={[0, 0, 23]}
                rotation-z={.47}
                material={material.blue}
                geometry={geometry.sphere}
                scale={[7, 7, 7]}
            />


            <mesh
                position={[-8, 0, depth / 2]}
                rotation-z={.25}
                material={material.blue}
                geometry={geometry.sphere}
                scale={[5, 5, 5]}
            />
            <mesh
                position={[-2, 0, depth / 2]}
                rotation-z={-.1}
                material={material.blue}
                geometry={geometry.sphere}
                scale={[2, 2, 2]}
            />
            <mesh
                position={[-16, 0, 31]}
                rotation-z={-.1}
                material={material.blue}
                geometry={geometry.sphere}
                scale={[3, 3, 3]}
            /> 
        </>
    )
}