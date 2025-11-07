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

function Rock({
    position,
    scaly,
    rotation,
    radius,
    update,
    active = false
}) {
    const { nodes } = useGLTF(model)
    const shape = useMemo(() => {
        return new Sphere(radius * .85)
    }, [])

    useBody({
        mass: 0,
        position,
        definition: shape,
        rotation,
        active,
    })

    useFrame(() => {
        const { player: { vehicle } } = store.getState()

        if (!vehicle) {
            return
        }

        const [, , z] = position
        let newActive = Math.abs(vehicle.chassisBody.position.z - z) < 15

        if (vehicle.chassisBody.position.z > z + 2) {
            newActive = false
        }

        if (active !== newActive) {
            update({ active: newActive })
        }
    })

    useFrame(() => {
        const { player } = store.getState()

        if (!player.vehicle) {
            return
        }

        const buffer = radius * 2
        const [, , z] = position

        if (z < player.vehicle.chassisBody.position.z - buffer) {
            update({
                position: [
                    random.float(ROAD_CENTER_X + 4, ROAD_CENTER_X + 10) * random.pick(-1, 1),
                    random.float(0, .25),
                    z + interval + random.integer(-5, 5)
                ],
                active: false
            })
        }
    })

    return (
        <group
            dispose={null}

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

export default function Rocks({ count = 8 }) {
    const [rocks, setRocks] = useTransitionedState(() => {
        return Array.from({ length: count }).fill(null).map(() => {
            const radius = random.pick(1, 1.5, 2.5, 4, 1.85, 2, 3, 2.4)

            return {
                id: random.id(),
                position: [
                    random.integer(ROAD_CENTER_X + 1 + radius * 1.2, ROAD_CENTER_X + 12) * random.pick(-1, 1),
                    random.float(0, .35),
                    random.integer(-1, interval * .5)
                ] as Tuple3,
                rotation: [random.pick(Math.PI, 0), random.float(0, Math.PI * 2), random.pick(Math.PI, 0)],
                radius,
                scaly: random.float(.85, 1.25),
                active: false
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
