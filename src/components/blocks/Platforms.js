
import React, { useState, useEffect } from "react"
import Box from "../Box"
import random from "../../utils/random" 
 
export default function Platforms({ z, depth }) {
    let [platforms, setPlatforms] = useState([])

    useEffect(() => {
        let platforms = []
        let platformSize = 10
        let platformGap = 5
        let count = Math.floor(depth / (platformSize + platformGap))

        for (let i = 0; i < count; i++) {
            platforms.push({
                position: [
                    random.real(-2, 2), 
                    -25, 
                    z + platformSize / 2 + i * (platformSize + platformGap)
                ],
                size: [platformSize, 50, platformSize],
                rotation: []
            })
        }

        setPlatforms(platforms)
    }, []) 

    return (
        <>
            {platforms.map((i, index) => {
                return (
                    <Box
                        key={index}
                        size={i.size}
                        position={i.position}
                    />
                )
            })}
        </>
    )
}
