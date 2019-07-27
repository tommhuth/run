
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
    let [color] = useState(random.pick([0xFF0000, 0xFFFF00, 0xFF00FF]))
    let [h] = useState(random.integer(0, 1))
    let [x] = useState(random.real(-4, 4))
    let [rotation] = useState(random.real(-.135, .135))


    return (
        <>
            <Box
                position={[0, -2.5, z + depth / 2]}
                rotation={[0, 0, rotation]}
                size={[35, 5 + h, depth]}
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
