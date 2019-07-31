
import React, { useState } from "react"
import Box from "../Box"
import Only from "../Only"
import RockFace from "../RockFace"
import random from "../../utils/random"
import BlockSettings from "../../const/BlockSettings"

export default function Flat({ z, depth }) {
    let [extraHeight] = useState(random.integer(0, 1))
    let [width] = useState(random.integer(18, 22))
    let [hasObstacle] = useState(random.bool())
    let [obstacleX] = useState(random.real(-4, 4))

    return (
        <>
            <RockFace
                position={[0, -BlockSettings.BASE_HEIGHT / 2, z + depth / 2]}
                size={[width, BlockSettings.BASE_HEIGHT + extraHeight, depth]}
            />
            <Only if={hasObstacle}>
                <Box
                    position={[obstacleX, 2, z + depth / 1.25]}
                    size={[2, 4, 2]}
                    mass={20}
                />
            </Only>
        </>
    )
}
