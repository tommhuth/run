import React, { useEffect, useRef, useState } from "react"
import animate from "../data/animate"
import random from "../data/random"

export default function Boom({ id, remove, owner }) {
    let ref = useRef()
    let [offsetY] = useState(() => random.real(-.1, .1))

    useEffect(() => {
        return animate({
            from: { scale: 1, opacity: 1 },
            to: { scale: 3, opacity: 0 },
            duration: 250,
            render({ opacity, scale }) {
                ref.current.material.opacity = opacity
                ref.current.scale.set(scale, scale, scale)
                ref.current.position.x = owner.position.x
                ref.current.position.y = owner.position.y + offsetY
                ref.current.position.z = owner.position.z 
            },
            complete: () => {
                remove(id)
            }
        })
    }, [])

    return (
        <mesh
            ref={ref} 
            rotation-x={-Math.PI / 2}
        >
            <meshLambertMaterial
                attach={"material"}
                args={[{
                    color: 0xfffffF,
                    flatShading: true,
                    transparent: true,
                    emissive: 0xfffffF,
                    emissiveIntensity: 10
                }]}
            />
            <circleBufferGeometry attach={"geometry"} args={[2, 32]} />
        </mesh>
    )
}