import Cycler from "@data/Cycler"
import { useTransitionedState } from "@data/hooks/utils"
import { removeTrafficElement } from "@data/store/actions/traffic"
import { store, TrafficElement } from "@data/store/store"
import { useFrame } from "@react-three/fiber"
import { RigidVehicle } from "cannon-es"
import { memo, Suspense, useMemo } from "react"

import Delivery from "./Delivery"
import GarbageTruck from "./GarbageTruck"
import SedanSports from "./SedanSports"
import useSteeringBehaviour from "./useSteeringBehaviour"
import Van from "./Van"

const cycler = new Cycler([Van, Delivery, GarbageTruck, SedanSports], .1)

export default memo(({
    id,
    position,
    rotation,
    velocity,
    guide,
    direction
}: TrafficElement) => {
    const [vehicle, setVehicle] = useTransitionedState<RigidVehicle | null>(null)
    const Component = useMemo(() => cycler.next(), [])

    useSteeringBehaviour({
        vehicle,
        guide,
        direction,
        maxVelocity: velocity,
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
            removeTrafficElement(id)
        }
    })

    return (
        <Suspense fallback={null}>
            <Component
                ref={setVehicle}
                position={position}
                rotation={rotation}
            />
        </Suspense>
    )
})
