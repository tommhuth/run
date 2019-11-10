import React, { useState  } from "react" 
import SimulatedCylinder from "../SimulatedCylinder"
import ParticleCloud from "../ParticleCloud"
import Only from "../Only" 
import random from "../../data/random" 
 
export default function BaseTowerBlock({
    start, 
    depth
}) {
    let [width] = useState(random.integer(5, 8))
    let [y] = useState(random.integer(-1, 1))
    let [x] = useState(random.integer(-1, 1))
    let [cloud] = useState(random.bool(1.5))

    return (
        <>  
            {/* floor */}
            <SimulatedCylinder
                height={40}
                segments={12}
                radius={Math.max(width, depth) / 2}
                position={[x, -20 + y, start + depth / 2]}
            />
        </>
    )
}