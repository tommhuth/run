import Suv from "@components/vehicles/Suv"
import { setState } from "@data/store/actions"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { RigidVehicle } from "cannon-es"
import { useEffect, useMemo, useState } from "react"

import { useControls } from "./useControls"
import { Object3D } from "three/webgpu"

interface PlayerProps {
    position?: Tuple3
    rotation?: Tuple3
}

export default function Player({
    rotation,
    position,
}: PlayerProps) {
    let { keys } = useControls()
    let [ref, setRef] = useState<RigidVehicle | null>(null)
    let target = useMemo(() => new Object3D(), [])

    useEffect(() => {
        setState({ player: { vehicle: ref, mesh: null } })
    }, [ref])

    useFrame(() => {
        let steer = .25
        let forc = 100

        if (!ref) {
            return
        }

        if (keys.w || keys.ArrowUp) {
            ref.setWheelForce(forc, 2)
            ref.setWheelForce(forc, 3)
        } else if (keys.s || keys.ArrowDown) {
            ref.setWheelForce(-forc, 2)
            ref.setWheelForce(-forc, 3)
        } else {
            ref.setWheelForce(0, 2)
            ref.setWheelForce(0, 3)
        }

        if (keys.a) {
            ref.setSteeringValue(steer, 0)
            ref.setSteeringValue(steer, 1)
        } else if (keys.d) {
            ref.setSteeringValue(-steer, 0)
            ref.setSteeringValue(-steer, 1)
        } else {
            ref.setSteeringValue(0, 0)
            ref.setSteeringValue(0, 1)
        }
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
                    intensity={100}
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
