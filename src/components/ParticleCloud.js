import React, { useState } from "react"
import random from "../data/random"
import { ShaderMaterial, BufferGeometry, BufferAttribute, DynamicDrawUsage } from "three"
import { useFrame } from "react-three-fiber" 
import frag from "../../assets/shaders/particle.frag.glsl"
import vertex from "../../assets/shaders/particle.vertex.glsl"

export default function ParticleCloud({
    position = [0, 0, 0],
    maxCount = 15,
    minCount = 3,
    maxSize = 3,
    minSize = 6
}) {
    let [count] = useState(() => random.integer(minCount, maxCount))
    let [size] = useState(() => random.integer(minSize, maxSize))
    let [geometry] = useState(() => {
        let geometry = new BufferGeometry()
        let positions = new Float32Array(count * 3)
        let offsets = new Float32Array(count * 3)
        let alphas = new Float32Array(count * 1)

        for (let i = 0; i < count; i++) {
            positions.set([
                random.real(-size * 1.5, size * 1.5),
                random.real(-1, size / 2),
                random.real(-size * .65, size * .65)
            ], i * 3)

            offsets.set([
                random.real(.1, .1),
                random.real(-.1, .05),
                random.real(-.1, .1)
            ], i * 3)

            alphas.set([
                random.real(0.01, .9),
            ], i)
        }

        let positionAttribute = new BufferAttribute(positions, 3)
        let offsetAttribute = new BufferAttribute(offsets, 3)
        let alphaAttribute = new BufferAttribute(alphas, 1)

        positionAttribute.setUsage(DynamicDrawUsage)
        geometry.setAttribute("position", positionAttribute)
        geometry.setAttribute("offset", offsetAttribute)
        geometry.setAttribute("alpha", alphaAttribute)

        return geometry
    })
    let [mat] = useState(() => new ShaderMaterial({
        uniforms: {
            time: { type: "f", value: 0.0 }
        },
        vertexShader: vertex,
        fragmentShader: frag,
        transparent: true
    }))
    let [speed] = useState(random.real(.051, .15))

    useFrame(() => {
        mat.uniforms.time.value += speed
        mat.uniforms.time.needsUpdate = true
    })

    return (
        <points
            position={position}
            material={mat}
            geometry={geometry}
        />
    )
}