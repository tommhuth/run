import Suv from "@components/vehicles/Suv"
import { setState } from "@data/store/actions"
import { useTransitionedState } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { RigidVehicle } from "cannon-es"
import { useEffect, useMemo } from "react"
import { Object3D } from "three/webgpu"

import { useControls } from "./useControls"
import { ROAD_CENTER_X, ROAD_EDGE_X } from "@components/road/Road"

interface PlayerProps {
    position?: Tuple3
    rotation?: Tuple3
}

export default function Player({
    rotation,
    position,
}: PlayerProps) {
    const { motion } = useControls()
    const [vehicle, setVehicle] = useTransitionedState<RigidVehicle | null>(null)
    const target = useMemo(() => new Object3D(), [])

    useEffect(() => {
        setState({ player: { vehicle: vehicle, mesh: null } })
    }, [vehicle])

    useFrame((state, delta) => {
        if (!vehicle) {
            return
        }

        vehicle.setWheelForce(motion.wheelForce, 2)
        vehicle.setWheelForce(motion.wheelForce, 3)
        vehicle.setSteeringValue(motion.steering, 0)
        vehicle.setSteeringValue(motion.steering, 1)
    })

    useFrame(() => {
        if (Math.abs(vehicle?.chassisBody.position.x || 0) > 16) {
            vehicle?.chassisBody.velocity.setZero()
            vehicle?.chassisBody.torque.setZero()
            vehicle?.wheelBodies.forEach((e) => {
                e.torque.setZero()
                e.velocity.setZero()
            })
            vehicle.chassisBody.position.x = ROAD_CENTER_X - 2
            vehicle.chassisBody.position.y = 4

        }
    })

    return (
        <>
            <Suv
                ref={setVehicle}
                position={position}
                rotation={rotation}
            >
                <primitive object={target} position={[0, 1, 5]} />
                <spotLight
                    intensity={50}
                    position={[0, 1.5, 1]}
                    color={"#ffc641"}
                    angle={Math.PI * .3}
                    target={target}
                    penumbra={.5}
                    shadow-bias={-0.0002}
                />
                <pointLight
                    distance={8}
                    intensity={1.5}
                    position={[-2, 1.5, -2]}
                    color={"#d5faff"}
                />
            </Suv>
        </>
    )
}
