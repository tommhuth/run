
import React, { useState } from "react"
import Box from "./Box"
import random from "../utils/random"

export default function Block(props) { 
    switch (props.type) {
        case "flat":
            return <Flat {...props} key={props.id} />
        case "gap":
            return <Gap {...props} key={props.id} />
        default:
            throw new Error("Unknown block type " + props.type)
    }
}

function Flat({ z, depth }) {
    let [color] = useState(0xDDDDDD)
    let [h] = useState(random.integer(0, 1))
    let [x] = useState(random.real(-4, 4))
    let [rotation] = useState(random.real(-.2, .2)) 

    return (
        <>
            <Box
                position={[0, -7.5, z + depth / 2]}
                rotation={[0, 0, rotation]}
                size={[55, 15 + h, depth]}
                color={color}
            />
            <Box
                position={[x, 2, z + depth / 1.25]}
                size={[2, 4, 2]}
                mass={20}
                color={color}
            />
        </>
    )
}

function Gap() {
    return null
}
