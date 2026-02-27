import { Client } from "@data/SpatialHashGrid3D"
import { useStore } from "@data/store"
import { useTransitionedState } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import { useEffect, useState } from "react"

export default function useTrafficClient({
    vehicle,
    direction,
    type,
}) {
    const [client, setClient] = useTransitionedState<null | Client>(null)

    useEffect(() => {
        if (!vehicle) {
            return
        }

        const { grid } = useStore.getState()
        const client = grid.createClient(vehicle.chassisBody.position.toArray(), [1.5, 2, 3], {
            type,
            direction,
            vehicle
        })

        setClient(client)

        return () => {
            grid.remove(client)
        }
    }, [vehicle])

    useFrame(() => {
        if (!client || !vehicle) {
            return
        }

        const { grid } = useStore.getState()

        client.position = vehicle.chassisBody.position.toArray()
        grid.updateClient(client)
    })

    return client
}
