import { store } from "@data/store"
import { useFrame } from "@react-three/fiber"

import StreetLight from "./StreetLight"
import { LIGHT_INTERVAL } from "./StreetLights"

export default function StreetLightPair({
    position: [x, y, z],
    update,
    lights,
    id
}) {
    useFrame(() => {
        const { player } = store.getState()
        const buffer = 4

        if (!player.vehicle) {
            return
        }

        if (z < player.vehicle.chassisBody.position.z - buffer) {
            const z = Math.max(...lights.map(i => i.position[2]))

            update({
                position: [x, y, z + LIGHT_INTERVAL]
            }, id)
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
