
import React, { useRef, useEffect } from "react"
import { Font } from "three"
import oswaldFont from "../../assets/fonts/oswald.json"
import animate from "../data/animate"
import Config from "../Config"
import materials from "../shared/materials"

const font = new Font(oswaldFont)

function Text({
    x = 0,
    y = 0,
    z = 0,
    text,
    size = 1,
    index = 0,
    dead,
    ...rest
}) {
    let ref = useRef()

    useEffect(() => {
        if (dead) {
            return animate({
                from: { x: x + 10 },
                to: { x: x - 50 },
                duration: Config.BLOCK_OUT_DURATION,
                easing: "easeInQuart",
                render({ x }) {
                    ref.current.position.x = x
                }
            })
        }
    }, [dead, x])

    useEffect(() => {
        ref.current.position.set(x + 100, y, z)

        return animate({
            from: { x: x + 100 },
            to: { x: x + 10 },
            duration: 1600,
            delay: index * 250 + 1000,
            easing: "easeOutCubic",
            render({ x }) {
                ref.current.position.x = x
            }
        })
    }, [x, y, z, index])

    return (
        <mesh
            scale={[-1, 1, 1]}
            ref={ref}
            material={materials.player}
            {...rest}
        >
            <textGeometry
                attach="geometry"
                args={[
                    text,
                    {
                        size,
                        font,
                        height: .5,
                        curveSegments: 2,
                        bevelEnabled: false
                    }
                ]}
            />
        </mesh>
    )
}

export default function DistanceMarker({
    x = 0,
    y,
    z,
    distance = "",
    dead
}) {
    return (
        <>
            <Text
                text={distance.toString()}
                size={9}
                x={x}
                y={y + 16}
                index={0}
                z={z}
                dead={dead}
            />
            <Text
                text={"METERS, GURL"}
                size={3}
                x={x}
                index={1}
                y={y + 12}
                z={z}
                dead={dead}
            />
        </>
    )
}