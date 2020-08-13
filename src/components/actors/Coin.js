import React, { useEffect, useState, useMemo, useRef } from "react"
import { material, geometry } from "../../../old/src/data/resources"
import animate from "../../data/animate"
import { useFrame } from "react-three-fiber"
import { useStore, api } from "../../data/store"
import Config from "../../Config"

function useFrameNumber(speed = .1, init = 0, predicate) {
    let frame = useRef(init)

    useFrame(() => {
        if (predicate) {
            frame.current += speed
        }
    })

    return frame
}

let i = 0

function Coin({ x, y, z, id }) {
    let [count] = useState(() => i++)
    let [dead, setDead] = useState(false)
    let [ready, setReady] = useState(false)
    let [taken, setTaken] = useState(false)
    let addScore = useStore(state => state.addScore)
    let frame = useFrameNumber(.05, count, ready)
    let ref = useRef()
    let first = useRef(true)

    useFrame(() => {
        if (!dead && ready) {
            if (ref.current && !taken) {
                ref.current.rotation.y += .025
                ref.current.position.y = Math.cos(frame.current) * .5 + y + 1 + .5
            } else if (taken) {
                ref.current.position.y += (y + 8 - ref.current.position.y) * .1
                ref.current.material.transparent = true
                ref.current.material.opacity += (0 - ref.current.material.opacity) * .2

                if (ref.current.material.opacity < .01) {
                    setDead(true)
                }
            }
        }
    })

    useEffect(() => {
        if (dead) {
            ref.current.visible = false
        }
    }, [dead])

    useEffect(() => {
        ref.current.visible = false

        return animate({
            from: { y: y + 10 },
            to: { y: Math.cos(frame.current) * .5 + y + 1.5 },
            delay: Config.BLOCK_IN_DURATION + count * 175,
            easing: "easeOutBounce",
            duration: 1000,
            start() {
                ref.current.visible = true
            },
            complete() {
                setReady(true)
            },
            render({ y }) {
                ref.current.position.y = y
            }
        })
    }, [])

    useEffect(() => {
        first.current = false

        return api.subscribe((position) => {
            let threshold = 1.75

            if (
                !taken &&
                position.y > y - threshold && position.y < y + threshold &&
                position.z > z - threshold && position.z < z + threshold &&
                position.x < x + threshold && position.x > x - threshold
            ) {
                setTaken(true)
                addScore()
            }
        }, state => state.position)
    }, [id, taken])

    return (
        <mesh
            ref={ref}
            position={first.current ? [x, y + 1 + .5, z] : undefined}
            scale={[.85, 1, .85]}
        >
            <sphereBufferGeometry args={[1, 6, 2]} attach="geometry" />
            <meshPhongMaterial
                color={0xF5B82E}
                specular={0xffffff}
                emissive={0xF5B82E}
                emissiveIntensity={.5}
                attach="material"
                flatShading
                shininess={50}
            />
        </mesh>
    )
}

export default React.memo(Coin)