import { store } from "@data/store"
import { useTransitionedState } from "@data/utils"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"

import { ROAD_CENTER_X, ROAD_HEIGHT } from "./Road"
import StreetLight from "./StreetLight"

const interval = 25

function StreetLightPair({ position: [x, y, z], update, lights }) {
    useFrame(() => {
        const { player } = store.getState()
        const buffer = 4

        if (!player.vehicle) {
            return
        }

        if (z < player.vehicle.chassisBody.position.z - buffer) {
            const z = Math.max(...lights.map(i => i.position[2]))

            update({
                position: [x, y, z + interval]
            })
        }
    })

    return (
        <>
            <StreetLight
                position={[x, y, z]}
                scale={7}
                rotation={[0, Math.PI * .5, 0]}
            />
            <StreetLight
                position={[-x, y, z]}
                scale={7}
                rotation={[0, -Math.PI * .5, 0]}
            />
        </>
    )
}

export default function StreetLights({ count = 4 }) {
    const [lights, setLights] = useTransitionedState(() => {
        return Array.from({ length: count }).fill(null).map((i, index) => {
            const x = ROAD_CENTER_X + 2.25
            const z = index * interval
            const y = ROAD_HEIGHT - .25

            return {
                id: random.id(),
                position: [x, y, z] as Tuple3
            }
        })
    })

    return lights.map((i) => {
        return (
            <StreetLightPair
                key={i.id}
                {...i}
                lights={lights}
                update={(data) => {
                    setLights([
                        ...lights.filter(j => j.id !== i.id),
                        {
                            ...lights.find(j => j.id === i.id),
                            ...data
                        }
                    ])
                }}
            />
        )
    })
}
