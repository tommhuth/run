import React, { useMemo } from "react" 
import { Box, Vec3 } from "cannon" 
import { useCannon } from "../data/cannon"  

export default function SimulatedBox({
    position,
    mass = 0,
    size = [1, 1, 1],
    color = "#ccc"
}) { 
    let cannonConfig = useMemo(() => ({
        mass,
        position,
        shape: new Box(new Vec3(size[0] / 2, size[1] / 2, size[2] / 2))
    }), [])
    let ref = useCannon(cannonConfig)  

    return (
        <mesh ref={ref} position={position}>
            <boxBufferGeometry attach="geometry" args={size} />
            <meshPhongMaterial color={color} attach="material" />
        </mesh>
    )
}