import { useBody } from "@data/cannon"
import { removePathSection } from "@data/store"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { Box, Vec3 } from "cannon-es"
import { useMemo, useState, Suspense, useRef } from "react"
import { gray } from "../materials"
import { Tuple3 } from "../types/global"
import { BoxGeometry, Object3D } from "three"
import Rock from "./Rock"
import { Rock1 } from "./Rock1"

const box = new BoxGeometry(1, 1, 1, 1, 1, 1)

interface PathSectionProps {
    id: string
    size: Tuple3
    position: Tuple3
    ready?: boolean
    fixed?: boolean
}

export function useFoam(scale = [1, 1, 1], rot = 0, maxr = .5) {
    let ref = useRef<Object3D>(null)
    let t = useRef(Math.random() * 10)

    useFrame((state, delta) => {
        if (!ref.current) {
            return
        }

        ref.current.scale.x = scale[0] + Math.cos(t.current) * .1
        ref.current.scale.z = scale[2] + Math.sin(t.current) * .075
        ref.current.rotation.y = rot + Math.cos(t.current * .25) * maxr

        t.current += delta
    })

    return ref
}

export default function PathSection({
    fixed,
    id,
    size: [width, height, depth],
    position: [x, y, z],
}: PathSectionProps) {
    let definition = useMemo(() => new Box(new Vec3(width / 2, height / 2, depth / 2)), [])
    let rotation = useMemo(() => random.float(-.35, .35), [])
    let [sectionRef, body] = useBody({
        mass: 0,
        definition,
        position: [x, fixed ? y : y - 10, z],
        rotation: [0, rotation, 0]
    })
    let [ready, setReady] = useState(false)
    let rocks = useMemo(() => {
        return Array.from({ length: fixed ? 0 : random.integer(2, 4) }).fill(null).map((i, index, list) => {
            let radius = [.25, .5, .35, .65, .85][index % list.length]

            return {
                id: random.id(),
                radius,
                position: [
                    random.float(x - 2, x + 2),
                    y + height / 2,
                    random.float(z - 2, z + 2)
                ] as Tuple3
            }
        })
    }, [])
    let foamRef = useFoam([width + .5, .01, depth + .5], rotation, .1)

    useFrame(() => {
        body.position.y += (y - body.position.y) * .1

        if (!ready) {
            setReady(y - body.position.y < 2.5)
        }
    })

    useFrame(({ camera }) => {
        let backwardsBuffer = 2

        if (camera.position.z - backwardsBuffer > z + depth / 2) {
            removePathSection(id)
        }
    })

    return (
        <>
            {rocks.map((i) => {
                return (
                    <Rock
                        ready={ready} key={i.id}
                        {...i}
                    />
                )
            })}
            <mesh
                ref={sectionRef}
                castShadow
                receiveShadow
                geometry={box}
                scale={[width, height, depth]}
                material={gray}
            />
            <mesh
                position={[x, -4.5, z]}
                rotation-y={rotation}
                scale={[width + .5, .01, depth + .5]}
                geometry={box}
                ref={foamRef}
            >
                <meshBasicMaterial color="white" />
            </mesh>

            <Suspense>
                {Array.from({ length: 5 }).map((i, index) => (
                    <Rock1 key={index} position={[x, y, z]} />
                ))}
            </Suspense>
        </>
    )
}


