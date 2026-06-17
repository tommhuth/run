import { useCannonWorld } from "@data/cannon"
import { dampFactor, ndelta } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { Quaternion, RigidVehicle, Shape, Vec3 } from "cannon-es"
import { RefObject, useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { Group, Mesh, Object3D, Quaternion as ThreeQuaternion } from "three"

import { acquireVehicle, addVehicleToWorld, releaseVehicle, removeVehicleFromWorld } from "./vehiclePool"

export type Chassis = [Shape, Vec3?, Quaternion?][]
export type Wheel = { radius: number; position: Tuple3 }

interface UseRigidVehicleParams {
    mass: number
    chassis: Chassis
    wheels: Wheel[]
    position?: Tuple3
    rotation?: Tuple3
    verticalStabilityAdjust?: number
    horizontalStabilityAdjust?: number
    type?: "traffic" | "player"
}

const _wheelOffset = new Vec3()
const _chassisOffset = new Vec3()
const _quaternion = new ThreeQuaternion()

export const wheelKey = [
    "wheel-front-left",
    "wheel-front-right",
    "wheel-back-left",
    "wheel-back-right"
]

function syncVehicle(
    vehicle: RigidVehicle,
    verticalStabilityAdjust: number,
    horizontalStabilityAdjust: number,
    chassisRef: RefObject<Object3D | null>,
    wheelsRef: RefObject<Object3D | null>,
    delta: number,
    mode: "lerp" | "copy",
) {
    const chassisMesh = chassisRef.current

    if (!chassisMesh) {
        return
    }

    const qk = dampFactor(20, delta)
    const vk = dampFactor(16, delta)

    chassisMesh.quaternion.slerp(_quaternion.copy(vehicle.chassisBody.quaternion), qk)

    if (mode === "lerp") {
        chassisMesh.position.lerp(vehicle.chassisBody.position, vk)
    } else {
        chassisMesh.position.copy(vehicle.chassisBody.position)
    }

    vehicle.chassisBody.quaternion.vmult(_chassisOffset.set(0, -verticalStabilityAdjust, 0), _chassisOffset)
    chassisMesh.position.sub(_chassisOffset)

    const wheelBodies = vehicle.wheelBodies

    for (let index = 0; index < wheelBodies.length; index++) {
        const wheel = wheelBodies[index]
        const wheelMesh = wheelsRef.current?.children[index] as Mesh

        if (wheelMesh) {
            wheelMesh.quaternion.slerp(_quaternion.copy(wheel.quaternion), qk)

            if (mode === "lerp") {
                wheelMesh.position.lerp(wheel.position, vk)
            } else {
                wheelMesh.position.copy(wheel.position)
            }

            const side = (index + 1) % 2 === 0 ? 1 : -1

            wheel.quaternion.vmult(_wheelOffset.set(horizontalStabilityAdjust * side, 0, 0), _wheelOffset)
            wheelMesh.position.add(_wheelOffset)
        }
    }
}

export function useRigidVehicle({
    position = [0, 0, 0],
    rotation: incomingRotation = [0, 0, 0],
    horizontalStabilityAdjust = .015, // wheel push out
    verticalStabilityAdjust = 0, // center of mass adjust 
    mass,
    chassis,
    wheels,
    type = "traffic"
}: UseRigidVehicleParams, deps: any[] = []) {
    const chassisRef = useRef<Group>(null)
    const wheelsRef = useRef<Group>(null)
    const backWheelsRef = useRef<Group>(null)
    const { world, materials } = useCannonWorld()
    const vehicle = useMemo(() => {
        return acquireVehicle(
            {
                mass,
                chassis,
                wheels,
                horizontalStabilityAdjust,
                verticalStabilityAdjust,
                wheelMaterial: materials.wheel,
                type,
            },
            position,
            incomingRotation
        )
    }, [world, ...deps])

    useEffect(() => {
        addVehicleToWorld(world, vehicle)

        return () => {
            removeVehicleFromWorld(world, vehicle)
            releaseVehicle(chassis, vehicle)
        }
    }, [vehicle, world])

    useLayoutEffect(() => {
        syncVehicle(
            vehicle,
            verticalStabilityAdjust,
            horizontalStabilityAdjust,
            chassisRef,
            wheelsRef,
            1,
            "copy"
        )
    }, [])

    useFrame((state, delta) => {
        syncVehicle(
            vehicle,
            verticalStabilityAdjust,
            horizontalStabilityAdjust,
            chassisRef,
            wheelsRef,
            ndelta(delta),
            "lerp"
        )
    })

    return [chassisRef, wheelsRef, vehicle, backWheelsRef] as const
}
