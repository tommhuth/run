import React, { useState } from "react" 
import SimulatedCylinder from "../SimulatedCylinder"
import random from "../../data/random"

export default function PlainBlock({
    start, 
    depth
}) { 
    let [y] = useState(random.integer(-1, 1))
    let [x] = useState(random.integer(-1, 1))

    return (
        <>  
            <SimulatedCylinder
                radius={depth/2}
                height={20}
                mass={0}
                segments={12}
                position={[x, -10 + y, start + depth / 2]}
            />
        </>
    )
}