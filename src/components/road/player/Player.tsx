import { CollisionEvent } from "@data/cannon"
import { useTransitionedState } from "@data/hooks/utils"
import { setState } from "@data/store/actions/actions"
import { store, useStore } from "@data/store/store"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { RigidVehicle } from "cannon-es"
import { useEffect, useMemo, useRef } from "react"
import { damp } from "three/src/math/MathUtils.js"
import { Object3D, PointLight } from "three/webgpu"

import useTrafficClient from "../traffic/useTrafficClient"
import Smoker from "./Smoker"
import Suv from "./Suv"
import { useControls } from "./useControls"

interface PlayerProps {
    position?: Tuple3
    rotation?: Tuple3
}

export default function Player({
    rotation = [0, .45, 0],
}: PlayerProps) {
    const { motion } = useControls()
    const breaklightRef1 = useRef<PointLight>(null)
    const breaklightRef2 = useRef<PointLight>(null)
    const steering = useStore(i => i.player.steering)
    const [vehicle, setVehicle] = useTransitionedState<RigidVehicle | null>(null)
    const target = useMemo(() => new Object3D(), [])
    const [position, setPosition] = useTransitionedState<Tuple3>([-1.5, 2, 0])

    // usePlayerAlive(setPosition)
    useTrafficClient({
        vehicle,
        type: "player",
        direction: 1
    })

    useEffect(() => {
        if (!vehicle) {
            return
        }

        const crashes = new Map<number, boolean>()
        const onCollide = ({ body }: CollisionEvent) => {
            if (body.userData?.type === "streetlight" && !crashes.has(body.id)) {
                vehicle.chassisBody.velocity.scale(.6, vehicle.chassisBody.velocity)
                crashes.set(body.id, true)
            }
        }

        vehicle.chassisBody.addEventListener("collide", onCollide)

        return () => {
            vehicle.chassisBody.removeEventListener("collide", onCollide)
        }
    }, [vehicle])

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

    useFrame((state, delta) => {
        const intensity = motion.currentWheelForce >= 0 ? 0 : 10

        for (const ref of [breaklightRef1, breaklightRef2]) {
            if (!ref.current) {
                continue
            }

            ref.current.intensity = damp(ref.current.intensity, intensity, 14, delta)
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
                    intensity={120}
                    position={[0, 1, .15]}
                    color={"#ffc079"}
                    angle={Math.PI * .3}
                    target={target}
                    penumbra={.5}
                />

                {[breaklightRef1, breaklightRef2].map((ref, index) => (
                    <pointLight
                        distance={5}
                        ref={ref}
                        key={index}
                        position={[-.5 * (index === 0 ? -1 : 1), .6, -1.2]}
                        color={"#b50c00"}
                    />
                ))}
            </Suv>
            <Smoker />
        </>
    )
}
