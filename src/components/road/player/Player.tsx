import { useTransitionedState } from "@data/hooks/utils"
import { setState } from "@data/store/actions/actions"
import { store, useStore } from "@data/store/store"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { RigidVehicle } from "cannon-es"
import { useEffect, useMemo } from "react"
import { Object3D } from "three/webgpu"

import useTrafficClient from "../traffic/useTrafficClient"
import Suv from "./Suv"
import { useControls } from "./useControls"
import usePlayerAlive from "./usePlayerAlive"

interface PlayerProps {
    position?: Tuple3
    rotation?: Tuple3
}

export default function Player({
    rotation,
}: PlayerProps) {
    const { motion } = useControls()
    const steering = useStore(i => i.player.steering)
    const [vehicle, setVehicle] = useTransitionedState<RigidVehicle | null>(null)
    const target = useMemo(() => new Object3D(), [])
    const [position, setPosition] = useTransitionedState<Tuple3>([-1.25, 2, 0])

    useTrafficClient({
        vehicle,
        type: "player",
        direction: 1
    })
    usePlayerAlive(setPosition)

    useEffect(() => {
        return setState({
            player: {
                ...store.getState().player,
                vehicle: vehicle,
                mesh: null
            }
        })
    }, [vehicle])

    useFrame(() => {
        if (!vehicle) {
            return
        }

        steering.z = motion.currentWheelForce
        steering.y = motion.currentSteering

        for (const wheel of [2, 3]) {
            vehicle.setWheelForce(motion.currentWheelForce, wheel)
        }

        for (const wheel of [0, 1]) {
            vehicle.setSteeringValue(motion.currentSteering, wheel)
        }
    })

    return (
        <Suv
            ref={setVehicle}
            position={position}
            rotation={rotation}
            key={position[2]}
        >
            <primitive object={target} position={[0, 1, 5]} />
            <spotLight
                intensity={120}
                position={[0, 1, .15]}
                color={"#ffc079"}
                angle={Math.PI * .3}
                target={target}
                penumbra={.5}
            />
        </Suv>
    )
}
