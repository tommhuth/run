import random from "@huth/random"
import { useState } from "react"
import Cloud, { CloudProps } from "./Cloud"
import { useFrame } from "@react-three/fiber"
import { store } from "@data/store"
import { Tuple3 } from "src/types/global"

function getPosition(y = 0, z = 0): Tuple3 {
    return [
        random.pick(12, 8, 7, 5, 3) * random.pick(1, -1),
        y + random.float(-2, 5),
        z
    ]
}

export default function CloudSystem({ size = 10 }: { size?: number }) {
    let [clouds, setClouds] = useState<CloudProps[]>(() => {
        return Array.from({ length: size }).fill(null).map((i, index) => {
            return {
                id: random.id(),
                speed: random.float(.025, .3),
                position: getPosition(0, index * 3),
                damping: random.float(.25, 1)
            }
        })
    })
    let updateCloud = (id: CloudProps["id"], data: Partial<CloudProps>) => {
        setClouds([
            ...clouds.filter(i => i.id !== id),
            {
                ...clouds.find(i => i.id === id) as CloudProps,
                ...data
            }
        ])
    }

    useFrame(() => {
        let { state, player: { mesh }, path } = store.getState()
        let forward = path[0]

        if (!mesh || state == "gameover") {
            return
        }

        for (let { position, id } of clouds) {
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