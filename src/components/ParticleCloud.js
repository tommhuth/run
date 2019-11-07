import React, { useState, useRef } from "react"
import random from "../data/random"
import { Vector3,  PointsMaterial } from "three"
import { useFrame } from "react-three-fiber"
import textures from "../data/textures"

export default function ParticleCloud({
    position = [0, 0, 0],
    maxCount = 15,
    minCount = 15,
    maxSize = 3,
    minSize = 6
}) { 
    let [count] = useState(() => random.integer(minCount, maxCount))
    let [size] = useState(() => random.integer(minSize, maxSize))
    let [vertices] = useState(() => {
        let vertices = []

        for (let i = 0; i < count; i++) {
            vertices.push(
                new Vector3(
                    random.real(-size * 1.5, size * 1.5),
                    random.real(-1, size / 2),
                    random.real(-size * .65, size * .65)
                )
            )
        }

        return vertices
    })
    let [material] = useState(() => new PointsMaterial({
        map: textures.dot,
        transparent: true,
        size: .25,
        opacity: .5,
        alphaTest: .5,
        color: 0xffffff,
        sizeAttenuation: true
    }))
    let [params] = useState(() => {
        let params = []

        for (let i = 0; i < count; i++) {
            params.push({
                x: random.real(.001, .015),
                y: random.real(-.001, -.01),
                z: random.real(-.001, .01)
            })
        }

        return params
    })
    let ref = useRef()

    useFrame(() => {
        for (let i = 0; i < vertices.length; i++) {
            let vertex = vertices[i]
            let param = params[i]

            vertex.x += param.x
            vertex.y += param.y
            vertex.z += param.z
        }

        ref.current.verticesNeedUpdate = true
    })

    return (
        <points position={position} material={material}>
            <geometry attach="geometry" vertices={vertices} ref={ref} />
        </points>
    )
}