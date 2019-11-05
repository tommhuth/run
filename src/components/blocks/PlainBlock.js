import React, { useState } from "react" 
import SimulatedCylinder from "../SimulatedCylinder"
import random from "../../data/random"
import ParticleCloud from "../ParticleCloud"
import Only from "../Only"

window.random = random

export default function PlainBlock({
    start, 
    depth
}) { 
    let [y] = useState(random.integer(-1, 1))
    let [x] = useState(random.integer(-1, 1))
    let [cloud] = useState(random.bool(.5))

    return (
        <>  
            <Only if={cloud}>
                <ParticleCloud position={[-1, 0, start + depth / 2]} />
            </Only>

            <SimulatedCylinder
                radius={depth/2}
                height={40}
                mass={0}
                segments={12}
                position={[x, -20 + y, start + depth / 2]}
            />
        </>
    )
}