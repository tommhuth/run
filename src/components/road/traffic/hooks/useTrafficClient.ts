import { useTransitionedState } from "@data/hooks/utils"
import { Client } from "@data/SpatialHashGrid2D"
import { useStore } from "@data/store/store"
import { useFrame } from "@react-three/fiber"
import { useEffect } from "react"

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
        const client = grid.createClient(vehicle.chassisBody.position.toArray(), [1.5, 3], {
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

        client.position[0] = vehicle.chassisBody.position.x
        client.position[1] = vehicle.chassisBody.position.y
        client.position[2] = vehicle.chassisBody.position.z
        grid.updateClient(client)
    })

    return client
}
