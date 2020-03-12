import React  from "react" 
import { Box, Vec3 } from "cannon"
import { useCannon } from "../../data/cannon" 
import { material } from "../../data/resources" 

export default function PlainBlock({
    depth,
    start, 
    active,
    y
}) {
    let { ref } = useCannon({
        shape: new Box(new Vec3(100, 5, depth / 2)),
        active,
        collisionFilterGroup: 6,
        collisionFilterMask: 1 | 2 | 4,
        position: [0, y - 5, start + depth / 2]
    }) 

    return (
        <>
            <mesh material={active ? material.blue : material.red} ref={ref}>
                <boxBufferGeometry attach="geometry" args={[200, 10, depth]} />
            </mesh>
        </>
    )
}