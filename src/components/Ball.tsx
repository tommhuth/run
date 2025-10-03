import { useBody } from "@data/cannon"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { Sphere } from "cannon-es"
import { useMemo, useEffect } from "react"
import { ball } from "../materials"
import { Tuple3 } from "../types/global"
import { SphereGeometry } from "three"
import useWaterIntersection from "@data/useWaterIntersecton"
import { mergeRefs } from "react-merge-refs"

export interface BallProps {
    radius: number
    position: Tuple3
    ready?: boolean
}

const geometry = new SphereGeometry(1, 16, 16)

export default function Ball({
    radius,
    position: [x, y, z],
    ready = false
}: BallProps) {
    let definition = useMemo(() => new Sphere(radius), [radius])
    let mass = useMemo(() => random.float(.1, .5), [])
    let [bodyRef, body] = useBody({
        mass,
        definition,
        position: [x, y - 10, z],
    })
    let intersectionRef = useWaterIntersection({
        type: "circle",
        size: [radius * 2, radius * 2, radius * 2]
    })
    let ref = mergeRefs([intersectionRef, bodyRef])

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

