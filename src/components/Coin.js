import React, { useEffect, useState,useMemo, useRef } from "react"
import { api } from "../data/store"
import { material, geometry } from "../data/resources"
import animate from "../data/animate"
import { useFrame } from "react-three-fiber"

function useFrameNumber(speed = .1, init = 0) {
    let frame = useRef(init)

    useFrame(() => frame.current += speed)

    return frame
}

let i = 0

function Coin({ x, y, z, id, remove }) {
    let [count] = useState(() => i++)
    let [taken, setTaken] = useState(false)
    let frame = useFrameNumber(.05, count)
    let takenMaterial = useMemo(()=> {
        let mat = material.white.clone()

        mat.transparent = true

        return mat
    })
    let ref = useRef()
    let first = useRef(true)

    useFrame(() => {
        if (ref.current && !taken) {
            ref.current.rotation.y += .025
            ref.current.position.y = Math.cos(frame.current) * .5 + y + 1 + .5
        }
    })

    useEffect(() => {
        if (taken) { 
            return animate({
                from: { y: ref.current.position.y, opacity: 1 },
                to: { y: ref.current.position.y + 15, opacity: 0 },
                duration: 1000,
                render({ opacity, y }) {
                    takenMaterial.opacity = opacity 
                    ref.current.position.y = y 
                },
                complete: () => {
                    remove(id)
                    takenMaterial.dispose()
                }
            })
        }
    }, [taken, id])

    useEffect(() => {
        first.current = false

        return api.subscribe((position) => {
            let threshold = 1.75

            if (
                position.y > y - threshold && position.y < y + threshold &&
                position.z > z - threshold && position.z < z + threshold &&
                position.x < x + threshold && position.x > x - threshold
            ) {
                setTaken(true)
            }
        }, state => state.data.position)
    }, [id])

    return (
        <mesh
            ref={ref}
            position={first.current ? [x, y + 1 + .5, z] : undefined}
            scale={[.65, 1, .65]}
            geometry={geometry.coin}
            material={taken ? takenMaterial : material.white}
            dispose={null}
        />
    )
}

export default React.memo(Coin)