import { store } from "@data/store"
import { useTransitionedState } from "@data/utils"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { startTransition } from "react"

import Cloud, { CloudProps } from "./Cloud"

const xRange = [10, 25, 19, 12, 6, 8]

export default function CloudSystem({ size = 15 }: { size?: number }) {
    const [clouds, setClouds] = useTransitionedState<CloudProps[]>(() => {
        return Array.from({ length: size }).fill(null).map((i, index) => {
            return {
                id: random.id(),
                speed: random.float(.025, .3),
                position: [
                    random.pick(...xRange) * random.pick(1, -1),
                    0,
                    index * 5,
                ],
                damping: random.float(1, 3),
                scale: random.float(.75, 2.)
            }
        })
    })
    const updateCloud = (id: CloudProps["id"], data: Partial<CloudProps>) => {
        startTransition(() => {
            setClouds([
                ...clouds.filter(i => i.id !== id),
                {
                    ...clouds.find(i => i.id === id) as CloudProps,
                    ...data
                }
            ])
        })
    }

    useFrame(() => {
        const { state, player: { vehicle }, path } = store.getState()
        const forward = path[0]

        if (!vehicle || state == "gameover") {
            return
        }

        for (const { position, id } of clouds) {
            if (position[2] < vehicle.chassisBody.position.z - 4) {
                updateCloud(id, {
                    position: [
                        random.pick(...xRange) * random.pick(1, -1),
                        forward.position[1] + forward.size[1] / 2,
                        position[2] + size * 3
                    ]
                })
            }
        }
    })

    return clouds.map(({ id, ...rest }) => {
        return (
            <Cloud key={id} id={id} {...rest} />
        )
    })
}
