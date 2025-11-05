import { store } from "@data/store"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { startTransition, useState } from "react"

import Cloud, { CloudProps } from "./Cloud"

function getPosition(y = 0, z = 0): Tuple3 {
    return [
        random.pick(30, 25, 19, 12, 8) * random.pick(1, -1),
        0,
        z
    ]
}

export default function CloudSystem({ size = 14 }: { size?: number }) {
    const [clouds, setClouds] = useState<CloudProps[]>(() => {
        return Array.from({ length: size }).fill(null).map((i, index) => {
            return {
                id: random.id(),
                speed: random.float(.025, .3),
                position: getPosition(0, index * 3),
                damping: random.float(.25, 1),
                scale: random.float(2, 6)
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
        const { state, player: { mesh }, path } = store.getState()
        const forward = path[0]

        if (!mesh || state == "gameover") {
            return
        }

        for (const { position, id } of clouds) {
            if (position[2] < mesh?.position.z - 1) {
                updateCloud(id, {
                    position: getPosition(forward.position[1] + forward.size[1] / 2, position[2] + size * 3)
                })
            }
        }
    })

    return (
        <>
            {clouds.map(({ id, ...rest }) => {
                return (
                    <Cloud key={id} id={id} {...rest} />
                )
            })}
        </>

    )
}
