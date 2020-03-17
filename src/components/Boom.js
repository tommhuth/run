import React, { useEffect, useRef } from "react"
import animate from "../data/animate"

export default function Boom({ id, x, y, z, remove }) {
    let ref = useRef()

    useEffect(() => {
        return animate({
            from: { scale: 1, opacity: 1 },
            to: { scale: 3, opacity: 0 },
            duration: 250,
            render({ opacity, scale }) {
                ref.current.material.opacity = opacity
                ref.current.scale.set(scale, scale, scale)
            },
            complete: () => {
                remove(id)
            }
        })
    }, [])

    return (
        <mesh
            ref={ref}
            position={[x, y, z]}
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