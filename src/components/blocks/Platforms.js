
import React, { useState, useEffect } from "react"
import Box from "../Box"
import random from "../../utils/random"
import BlockSettings from "../../const/BlockSettings"
import Model from "../Model";

export default function Platforms({ z, depth }) {
    let [platforms, setPlatforms] = useState([]) 

    useEffect(() => {
        let platforms = []
        let acc = 0

        while (acc <= depth - 20 || depth - acc > 3) {
            let platformSize = random.integer(5, 8)
            let platformGap = random.integer(0, 3)
            
            platforms.push({
                type: random.pick(["box", "box2"]),
                position: [
                    random.real(-2, 2),
                    -BlockSettings.BASE_HEIGHT / 2,
                    z + platformSize / 2 + platformGap + acc
                ],
                size: [
                    platformSize,
                    BlockSettings.BASE_HEIGHT + random.integer(-1, 1),
                    platformSize
                ],
                rotation: [
                    random.real(-.05, .05),
                    random.real(-.25, .25),
                    random.real(-.05, .05)
                ],
            })

            acc += platformGap + platformSize
        }

        setPlatforms(platforms)
    }, [])

    return (
        <>
            {platforms.map((i, index) => {
                return (
                    <Model
                        type={i.type}
                        key={index}
                        rotation={i.rotation}
                        scale={i.size}
                        position={i.position}
                    />
                )
            })}
        </>
    )
}
