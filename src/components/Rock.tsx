import { useBody } from "@data/cannon"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { Sphere } from "cannon-es"
import { useMemo, useEffect } from "react"
import { gray } from "../materials"
import { Tuple3 } from "../types/global"
import { SphereGeometry } from "three"

interface RockProps {
    radius: number
    position: Tuple3
    ready?: boolean
}

const geometry = new SphereGeometry(1)

export default function Rock({
    radius,
    position: [x, y, z],
    ready = false
}: RockProps) {
    let s = useMemo(() => new Sphere(radius), [radius])
    let mass = useMemo(() => random.float(.1, .5), [])
    let [ref, body] = useBody({
        mass,
        definition: s,
        position: [x, y - 10, z],
    })

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
            material={gray}
            scale={radius}
            geometry={geometry}
        />
    )
}

