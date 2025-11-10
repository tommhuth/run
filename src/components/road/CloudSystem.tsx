import CloudMaterial from "@components/materials/CloudMaterial"
import { store } from "@data/store"
import { useTransitionedState } from "@data/utils"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { MeshBasicMaterial } from "three"

import Cloud, { CloudProps } from "./Cloud"

const xRange = [10, 25, 19, 12, 6, 8]
const interval = 4

export default function CloudSystem({ size = 15 }: { size?: number }) {
    const [material, setMaterial] = useTransitionedState<MeshBasicMaterial | null>(null)
    const [clouds, setClouds] = useTransitionedState<CloudProps[]>(() => {
        return Array.from({ length: size }).fill(null).map((i, index) => {
            return {
                id: random.id(),
                speed: random.float(.025, .3),
                position: [
                    random.pick(...xRange) * random.pick(1, -1),
                    0,
                    index * interval + random.float(-2, 2),
                ],
                damping: random.float(.5, .9),
                scale: random.float(.75, 2.)
            }
        })
    })
    const updateCloud = (id: CloudProps["id"], data: Partial<CloudProps>) => {
        setClouds([
            ...clouds.filter(i => i.id !== id),
            {
                ...clouds.find(i => i.id === id) as CloudProps,
                ...data
            }
        ])
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
                        position[2] + size * interval
                    ]
                })
            }
        }
    })

    return (
        <>
            <CloudMaterial ref={setMaterial} />

            {material && clouds.map(({ id, ...rest }) => {
                return (
                    <Cloud
                        material={material}
                        key={id}
                        id={id}
                        {...rest}
                    />
                )
            })}
        </>
    )
}
