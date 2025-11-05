import model from "@assets/models/rock.glb"
import { useBody } from "@data/cannon"
import { store } from "@data/store"
import { useTransitionedState } from "@data/utils"
import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { Sphere } from "cannon-es"
import { useMemo } from "react"

import { ROAD_CENTER_X } from "./Road"

const interval = 90

function Rock({ position, scaly, rotation, radius, update }) {
    let [active, setActive] = useTransitionedState(false)
    let shape = useMemo(() => {
        return new Sphere(radius)
    }, [])
    const [ref] = useBody({
        mass: 0,
        position,
        definition: shape,
        active,
        rotation
    })
    const { nodes } = useGLTF(model)

    useFrame(() => {
        let { player } = store.getState()

        if (!player.vehicle) {
            return
        }

        let p = player.vehicle.chassisBody.position.z
        let buffer = radius * 2
        let [, , z] = position
        let newActive = Math.abs(p - z) < 30

        if (active !== newActive) {
            setActive(newActive)
        }


        if (z < player.vehicle.chassisBody.position.z - buffer) {
            update({
                position: [
                    random.float(ROAD_CENTER_X + 4, ROAD_CENTER_X + 10) * random.pick(-1, 1),
                    random.float(0, .25),
                    z + interval
                ],
            })
        }
    })

    return (
        <group
            dispose={null}
            ref={ref}
            position={position}
            rotation={rotation}
        >
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.rock.geometry}
                material={nodes.rock.material}
                scale={radius * 2}
                scale-y={radius * 2 * scaly}
            />
        </group>
    )
}

export default function Rocks({ count = 12 }) {
    let [rocks, setRocks] = useTransitionedState(() => {
        return Array.from({ length: count }).fill(null).map(() => {
            let radius = random.pick(1, 1.5, 2.5, 4, 1.85, 2, 3, 2.4)

            return {
                id: random.id(),
                position: [
                    random.integer(ROAD_CENTER_X + 1 + radius * 1.2, ROAD_CENTER_X + 12) * random.pick(-1, 1),
                    random.float(0, .35),
                    random.integer(-1, interval)
                ] as Tuple3,
                rotation: [0, random.float(0, Math.PI * 2), 0],
                radius,
                scaly: random.float(.85, 1.25)
            }
        })
    })

    return rocks.map((i) => {
        return (
            <Rock
                key={i.id}
                {...i}
                update={(data) => {
                    setRocks([
                        ...rocks.filter(j => j.id !== i.id),
                        {
                            ...rocks.find(j => j.id === i.id),
                            ...data
                        }
                    ])
                }}
            />
        )
    })
}
