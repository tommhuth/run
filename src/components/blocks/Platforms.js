
import React, { useState, useEffect } from "react"
import random from "../../utils/random"
import BlockSettings from "../../const/BlockSettings" 
import RockPillar from "../RockPillar"

export default function Platforms({ z, depth }) {
    let [platforms, setPlatforms] = useState([])

    useEffect(() => {
        let platforms = []
        let acc = 0

        while (depth - acc > 3) {
            let platformSize = random.integer(2, 4)
            let platformGap = random.integer(1, 2)

            platforms.push({ 
                position: [
                    random.real(-2, 2),
                    -BlockSettings.BASE_HEIGHT / 2,
                    z + platformSize / 2 + platformGap + acc
                ],
                height: BlockSettings.BASE_HEIGHT + random.integer(-1, 1),
                size: platformSize
            })

            acc += platformGap + platformSize
        }

        setPlatforms(platforms)
    }, [])

    return (
        <>
            {platforms.map((i, index) => {
                return (
                    <RockPillar 
                        key={index} 
                        size={i.size}
                        height={i.height}
                        position={i.position}
                    />
                )
            })}
        </>
    )
}
