
import React, { useState } from "react"
import Model from "../Model"
import Only from "../Only"
import RockFace from "../RockFace"
import random from "../../utils/random"
import BlockSettings from "../../const/BlockSettings"
import Coin from "../Coin"
 
export default function Flat({ z, depth }) {
    let [extraHeight] = useState(random.integer(0, 1))
    let [width] = useState(random.integer(15, 18))
    let [hasObstacle] = useState(random.bool())
    let [obstacleX] = useState(random.real(-2, 2))
    let [obstacleZ] = useState(random.real(4, depth - 4))

    return (
        <>
            <Coin position={[0, 1, z+ depth/2 -2]} />
            <Coin position={[0, 1, z+ depth/2]} />
            <Coin position={[0, 1, z+ depth/2 + 2]} />
            <RockFace
                scaling={2}
                position={[0, -BlockSettings.BASE_HEIGHT / 2, z + depth / 2]}
                size={[width, BlockSettings.BASE_HEIGHT + extraHeight, depth]}
            />
            <Only if={hasObstacle && false}>
                <Model
                    position={[obstacleX, 2, z + obstacleZ]}
                    scale={[3, 2, 2.5]}
                    mass={20}
                    type={"block"}
                />
            </Only>
        </>
    )
}
