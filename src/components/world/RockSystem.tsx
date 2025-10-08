import { store } from "@data/store"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { Tuple2 } from "@src/types/global"
import { startTransition, useState } from "react"

import Rock, { RockProps } from "./Rock"

const baseSize = [2, 16, 2]

const xRange: Tuple2 = [4, 13]
const yRange: Tuple2 = [1, 8]
const scaleRange: Tuple2 = [1, 1.25]

export default function RockSystem({ count = 25 }) {
    const [rocks, setRocks] = useState(() => {
        return Array.from({ length: count })
            .fill(null)
            .map(() => {
                return {
                    id: random.id(),
                    scale: random.float(...scaleRange),
                    position: [
                        random.float(...xRange) * random.pick(-1, 1),
                        random.integer(...yRange) - baseSize[1] / 2 - 4.5,
                        random.float(-1, 20)
                    ]
                } satisfies RockProps
            })
    })

    useFrame(({ camera }) => {
        const { path, state } = store.getState()
        const forward = path[0]

        if (state != "running") {
            return
        }

        for (const { position, id } of rocks) {
            if (position[2] < camera.position.z - 2) {
                startTransition(() => {
                    setRocks([
                        ...rocks.filter(i => i.id !== id),
                        {
                            ...rocks.find(i => i.id === id) as RockProps,
                            scale: random.float(...scaleRange),
                            position: [
                                forward.position[0] + random.float(...xRange) * random.pick(-1, 1),
                                random.integer(...yRange) - baseSize[1] / 2 - 4.5,
                                position[2] + 25
                            ]
                        }
                    ])
                })
            }
        }
    })

    return rocks.map(i => {
        return <Rock key={i.id} {...i} />
    })
}
