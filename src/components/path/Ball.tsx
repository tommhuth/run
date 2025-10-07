import { useBody } from "@data/cannon"
import useWaterIntersection from "@data/useWaterIntersecton"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { ball } from "@src/materials"
import { Tuple3 } from "@src/types/global"
import { Sphere } from "cannon-es"
import { useEffect, useMemo } from "react"
import { mergeRefs } from "react-merge-refs"
import { SphereGeometry } from "three"

export interface BallProps {
    radius: number
    position: Tuple3
    ready?: boolean
    id: string
}

const geometry = new SphereGeometry(1, 16, 16)

export default function Ball({
    radius,
    position: [x, y, z],
    ready = false
}: BallProps) {
    const definition = useMemo(() => new Sphere(radius), [radius])
    const mass = useMemo(() => random.float(.1, .5), [])
    const [bodyRef, body] = useBody({
        mass,
        definition,
        position: [x, y - 10, z],
    })
    const intersectionRef = useWaterIntersection({
        type: "circle",
        size: [radius * 2, radius * 2, radius * 2],
        threshold: radius / 2
    })
    const ref = mergeRefs([intersectionRef, bodyRef])

    useEffect(() => {
        if (ready) {
            body.velocity.y += random.float(2, 2)
        }
    }, [ready])

    useFrame(() => {
        if (!ready) {
            body.position.y += (y - body.position.y) * .1
        }

        body.velocity.x *= .99
        body.velocity.z *= .99
    })

    return (
        <mesh
            ref={ref}
            castShadow
            receiveShadow
            material={ball}
            dispose={null}
            scale={radius}
            geometry={geometry}
        />
    )
}
