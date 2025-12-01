import { ROAD_GAME_OVER_X_EDGE } from "@components/road/Road"
import Suv from "@components/vehicles/Suv"
import { store } from "@data/store"
import { setState } from "@data/store/actions"
import { extractRotation, useTransitionedState } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { RigidVehicle } from "cannon-es"
import { useEffect, useMemo } from "react"
import { Object3D } from "three/webgpu"

import { useControls } from "./useControls"

interface PlayerProps {
    position?: Tuple3
    rotation?: Tuple3
}

const MAX_ROTATION = Math.PI * .5 * .75

export default function Player({
    rotation,
}: PlayerProps) {
    const { motion } = useControls()
    const [vehicle, setVehicle] = useTransitionedState<RigidVehicle | null>(null)
    const target = useMemo(() => new Object3D(), [])
    const [position, setPosition] = useTransitionedState<Tuple3>([-1.25, 1, 0])

    useEffect(() => {
        setState({ player: { vehicle: vehicle, mesh: null } })
    }, [vehicle])

    useFrame(() => {
        if (!vehicle) {
            return
        }

        vehicle.setWheelForce(motion.wheelForce, 2)
        vehicle.setWheelForce(motion.wheelForce, 3)
        vehicle.setSteeringValue(motion.steering, 0)
        vehicle.setSteeringValue(motion.steering, 1)
    })

    useFrame(() => {
        if (!vehicle) {
            return
        }

        const rotation = Math.abs(extractRotation(vehicle.chassisBody.quaternion).y)
        const offside = Math.abs(vehicle.chassisBody.position.x)

        if (offside > ROAD_GAME_OVER_X_EDGE || rotation > MAX_ROTATION) {
            const forwards = store.getState().traffic
                .filter(i => i.direction === 1)
                .map(i => i.position[2])

            setPosition([-2, 2, Math.min(...forwards) - 6])
        }
    })

    return (
        <>
            <Suv
                ref={setVehicle}
                position={position}
                rotation={rotation}
                key={position[2]}
            >
                <primitive object={target} position={[0, 1, 5]} />
                <spotLight
                    intensity={80}
                    position={[0, 1.5, 1]}
                    color={"#f1ffd4"}
                    angle={Math.PI * .3}
                    target={target}
                    penumbra={.5}
                />
            </Suv>
        </>
    )
}
