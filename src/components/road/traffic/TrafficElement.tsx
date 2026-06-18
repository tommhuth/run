import Cycler from "@data/Cycler"
import { useLowerPriorityFrame, useTransitionedState } from "@data/hooks/utils"
import { removeTrafficElement } from "@data/store/actions/traffic"
import { store, TrafficElement } from "@data/store/store"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { RigidVehicle } from "cannon-es"
import { memo, Suspense, useMemo } from "react"

import Delivery from "./Delivery"
import GarbageTruck from "./GarbageTruck"
import HatchbackSports from "./HatchbackSports"
import SedanSports from "./SedanSports"
import SuvLuxury from "./SuvLuxury"
import Truck from "./Truck"
import TruckFlat from "./TruckFlat"
import useSteeringBehaviour from "./hooks/useSteeringBehaviour"
import Van from "./Van"

const common = new Cycler([HatchbackSports, SedanSports, SuvLuxury, Truck, TruckFlat, Van], .15)
const rare = new Cycler([Delivery, GarbageTruck], 0)

export default memo(({
    id,
    position,
    rotation,
    velocity,
    guide,
    direction
}: TrafficElement) => {
    const [vehicle, setVehicle] = useTransitionedState<RigidVehicle | null>(null)
    const pool = useMemo(() => random.boolean(.75) ? common : rare, [])
    const Component = useMemo(() => pool.next(), [pool])

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

    useLowerPriorityFrame(() => {
        const { player } = store.getState()
        const backbuffer = 6

        if (!player.vehicle || !vehicle) {
            return
        }

        if (vehicle.chassisBody.position.z < player.vehicle?.chassisBody.position.z - backbuffer) {
            removeTrafficElement(id)
        }
    }, 250)

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
