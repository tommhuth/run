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
    const { motion } = useControls()
    const [ref, setRef] = useTransitionedState<RigidVehicle | null>(null)
    const target = useMemo(() => new Object3D(), [])

    useEffect(() => {
        setState({ player: { vehicle: ref, mesh: null } })
    }, [ref])

    useFrame((state, delta) => {
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
