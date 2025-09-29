import random from "@huth/random"
import { useState } from "react"
import Cloud from "./Cloud"
import { useFrame } from "@react-three/fiber"
import { store } from "@data/store"
import { Tuple3 } from "src/types/global"

function getPosition(x = 0, y = 0, z = 0): Tuple3 {
    return [
        x + random.pick(10, 8, 7, 5, 3) * random.pick(1, -1),
        y + random.float(-3, 7),
        z
    ]
}

export default function CloudSystem({ size = 10 }) {
    let [clouds, setClouds] = useState(() => {
        return Array.from({ length: size }).fill(null).map((i, index) => {
            return {
                id: random.id(),
                speed: random.float(.025, .3),
                position: getPosition(0, 0, index * 3),
                damping: random.float(.25, 1)
            }
        })
    })
    let updateCloud = (id: string, data: any) => {
        setClouds([
            ...clouds.filter(i => i.id !== id),
            {
                ...clouds.find(i => i.id === id),
                ...data
            }
        ])
    }

    useFrame(() => {
        let { state, player: { mesh } } = store.getState()

        if (!mesh || state == "gameover") {
            return
        }

        for (let { position, id } of clouds) {
            if (position[2] < mesh?.position.z - 1) {
                updateCloud(id, {
                    position: getPosition(0, 0, position[2] + size * 3)
                })
            }
        }
    })

    return clouds.map(({ id, ...rest }) => {
        return (
            <Cloud key={id} {...rest} />
        )
    })
}