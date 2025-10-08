import dirtModel from "@assets/models/dirt.glb"
import ExternalModel from "@components/ExternalModel"
import { useBody } from "@data/cannon"
import useWaterIntersection from "@data/useWaterIntersecton"
import { ndelta } from "@data/utils"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { gray } from "@src/materials"
import { Tuple3 } from "@src/types/global"
import { Box, Vec3 } from "cannon-es"
import { memo, startTransition, useMemo, useState } from "react"
import { mergeRefs } from "react-merge-refs"
import { BoxGeometry } from "three"
import { damp } from "three/src/math/MathUtils.js"

import Ball, { BallProps } from "./Ball"

const box = new BoxGeometry(1, 1, 1, 1, 1, 1)

interface BlockProps {
    size: Tuple3
    position: Tuple3
    fixed: boolean
    rotation?: number
}

function Block({
    size: [width, height, depth],
    position: [x, y, z],
    rotation: incomingRotation,
    fixed,
}: BlockProps) {
    const dirt = useMemo(() => random.boolean(.6), [])
    const definition = useMemo(() => new Box(new Vec3(width / 2, height / 2, depth / 2)), [])
    const rotation = useMemo(() => {
        return typeof incomingRotation === "number" ? incomingRotation : random.float(-.35, .35)
    }, [incomingRotation])
    const [sectionRef, body] = useBody({
        mass: 0,
        definition,
        position: [x, fixed ? y : y - 10, z],
        rotation: [0, rotation, 0]
    })
    const intersectionRef = useWaterIntersection({
        size: [width, height, depth],
        extension: .35,
        type: "box"
    })
    const ref = mergeRefs([intersectionRef, sectionRef])
    const [atPosition, setAtPosition] = useState(false)
    const balls = useMemo(() => {
        return Array.from({ length: fixed ? 0 : random.integer(1, 3) })
            .fill(null)
            .map((i, index, list) => {
                const radius = [.25, .5, .35, .65, .85][index % list.length]

                return {
                    id: random.id(),
                    radius,
                    position: [
                        random.float(x - 2, x + 2),
                        y + height / 2,
                        random.float(z - 2, z + 2)
                    ] as Tuple3
                } satisfies BallProps
            })
    }, [])

    useFrame((state, delta) => {
        body.position.y = damp(body.position.y, y, 4, ndelta(delta))
        const currentAtPosition = y - body.position.y < 2.5

        if (!atPosition && currentAtPosition) {
            startTransition(() => setAtPosition(currentAtPosition))
        }
    })

    return (
        <>
            <group ref={ref}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={box}
                    scale={[width, height, depth]}
                    material={gray}
                    dispose={null}

                />
                {dirt && (
                    <ExternalModel
                        url={dirtModel}
                        name="dirt"
                        position={[0, height / 2, 0]}
                        scale={[width * .15, 1, depth * .16]}
                        material={gray}
                        rotation-y={Math.sin(z * .2)}
                        castShadow
                        receiveShadow
                    />
                )}
            </group>

            {balls.map((i) => {
                return (
                    <Ball
                        ready={atPosition}
                        key={i.id}
                        {...i}
                    />
                )
            })}
        </>
    )
}

export default memo(Block)
