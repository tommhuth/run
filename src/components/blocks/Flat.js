import React, { useState } from "react"
import Model from "../Model"
import Only from "../Only"
import RockFace from "../RockFace"
import random from "../../utils/random"
import BlockSettings from "../../const/BlockSettings"
import Coin from "../Coin"
import { ShapeType } from "../../../assets/addons/meshToShape"

export default function Flat({ z, depth }) {
    let [extraHeight] = useState(random.integer(0, .5))
    let [obstacleX] = useState(random.real(0, 0))
    let [mainX] = useState(random.integer(-2, 2))
    let [coinX] = useState(random.real(-2, 2))
    let [hasCoin] = useState(random.bool())
    let [hasObstacle] = useState(!hasCoin)
    let [obstacleZ] = useState(random.real(2, depth - 2))
    let [obstacleY] = useState(random.real(-.25, .25))
    let [obstacleScale] =  useState(random.real(.5, .5)) 

    return (
        <>
            <Only if={hasObstacle}>
                <Model
                    position={[obstacleX + mainX, obstacleY + extraHeight / 2, z + obstacleZ]}
                    scale={[obstacleScale, obstacleScale, obstacleScale]}
                    mass={0}
                    shapeType={ShapeType.SPHERE} 
                    type={"rock1"}
                />
            </Only>
            <RockFace
                scaling={2}
                position={[mainX, -BlockSettings.BASE_HEIGHT / 2, z + depth / 2]}
                size={[depth, BlockSettings.BASE_HEIGHT + extraHeight, depth]}
            />
            <Only if={hasCoin}>
                <Coin position={[mainX + coinX, 1, z + depth / 2 - 1]} />
                <Coin position={[mainX + coinX, 1, z + depth / 2]} />
                <Coin position={[mainX + coinX, 1, z + depth / 2 + 1]} />
            </Only>
        </>
    )
}
