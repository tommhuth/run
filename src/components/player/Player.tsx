import Suv from "@components/vehicles/Suv"
import { setState } from "@data/store/actions"
import { useTransitionedState } from "@data/utils"
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

export default function Player({
    rotation,
    position,
}: PlayerProps) {
    let { motion } = useControls()
    let [ref, setRef] = useTransitionedState<RigidVehicle | null>(null)
    let target = useMemo(() => new Object3D(), [])

    useEffect(() => {
        setState({ player: { vehicle: ref, mesh: null } })
    }, [ref])

    useFrame(() => {
        if (!ref) {
            return
        }

        ref.setWheelForce(motion.wheelForce, 2)
        ref.setWheelForce(motion.wheelForce, 3)
        ref.setSteeringValue(motion.steering, 0)
        ref.setSteeringValue(motion.steering, 1)
    })

    return (
        <>
            <Suv
                ref={setRef}
                position={position}
                rotation={rotation}
            >
                <primitive object={target} position={[0, 1, 5]} />
                <spotLight
                    intensity={25}
                    position={[0, 1.5, 1]}
                    color={"#fff7e5"}
                    angle={Math.PI * .3}
                    target={target}
                    penumbra={.5}
                    shadow-bias={-0.0002}
                />
            </Suv>
        </>
    )
}
