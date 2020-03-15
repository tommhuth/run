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
                position={[1, 0, 10]}
                material={material.blue}
                geometry={geometry.sphere}
                rotation-x={.7}
                scale={[11, 11, 11]}
            />
            <mesh
                position={[11, 0, 26]}
                rotation-y={.7}
                material={material.blue}
                geometry={geometry.sphere}
                scale={[7, 7, 7]}
            /> 

            <mesh
                position={[15, 0, 43]}
                rotation-x={-.17}
                material={material.blue}
                geometry={geometry.sphere}
                scale={[3, 3, 3]}
            />
            <mesh
                position={[-4, 0, 26]}
                rotation-z={.7}
                material={material.blue}
                geometry={geometry.sphere}
                scale={[5, 5, 5]}
            />
            <mesh
                position={[-8, 0, depth / 2]}
                material={material.blue}
                geometry={geometry.sphere}
                scale={[3, 3, 3]}
            />
        </>
    )
}