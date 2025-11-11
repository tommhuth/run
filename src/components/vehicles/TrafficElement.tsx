import Sedan from "@components/vehicles/Sedan"
import { store } from "@data/store"
import { useTransitionedState } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { RigidVehicle } from "cannon-es"

import useSteeringBehaviour from "./useSteeringBehaviour"

interface TrafficElementProps {
    position: Tuple3
    rotation: Tuple3
    guide: Tuple3
    velocity?: number
    direction: 1 | -1
    id: string
    remove: () => void
}


function TrafficElement({
    position,
    rotation,
    velocity,
    guide,
    direction,
    remove
}: TrafficElementProps) {
    const [vehicle, setVehicle] = useTransitionedState<RigidVehicle | null>(null)

    useSteeringBehaviour({
        vehicle,
        target: guide,
        direction,
        targetVelocity: velocity,
        wheelForce: 20
    })

    useFrame(() => {
        if (!vehicle) {
            return
        }

        position[0] = vehicle.chassisBody.position.x
        position[1] = vehicle.chassisBody.position.y
        position[2] = vehicle.chassisBody.position.z
    })

    useFrame(() => {
        const { player } = store.getState()
        const backbuffer = 6

        if (!player.vehicle || !vehicle) {
            return
        }

        if (vehicle.chassisBody.position.z < player.vehicle?.chassisBody.position.z - backbuffer) {
            remove()
        }
    })

    return (
        <Sedan
            ref={setVehicle}
            position={position}
            rotation={rotation}
        />
    )
};

export default TrafficElement
