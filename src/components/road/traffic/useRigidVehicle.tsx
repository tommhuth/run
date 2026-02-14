import { useCannonWorld } from "@data/cannon"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { Body, Quaternion, RigidVehicle, Shape, Sphere, Vec3 } from "cannon-es"
import { useEffect, useMemo, useRef } from "react"
import { Group, Mesh } from "three"

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
}

const _emptyOffset = new Vec3()
const _wheelOffset = new Vec3()
const _chassisOffset = new Vec3()
const _emptyQuaternion = new Quaternion()

const direction = new Vec3(0, -1, 0)

export const wheelKey = ["wheel-front-left", "wheel-front-right", "wheel-back-left", "wheel-back-right"]

export function useRigidVehicle({
    position = [0, 0, 0],
    rotation: incomingRotation = [0, 0, 0],
    horizontalStabilityAdjust = .025, // wheel push out
    verticalStabilityAdjust = 0, // center of mass adjust 
    mass,
    chassis,
    wheels
}: UseRigidVehicleParams) {
    const chassisRef = useRef<Group>(null)
    const wheelsRef = useRef<Group>(null)
    const backWheelsRef = useRef<Group>(null)
    const world = useCannonWorld()
    const [vehicle] = useMemo(() => {
        const rotation = new Quaternion().setFromEuler(...incomingRotation)
        const contactMaterial = null
        const centerOfMassAdjust = new Vec3(0, verticalStabilityAdjust, 0)
        const chassisBody = new Body({
            mass,
            position: position ? new Vec3(...position) : undefined,
            quaternion: rotation,
            allowSleep: false,
        })

        for (const [shape, offset = _emptyOffset, quaternion = _emptyQuaternion] of chassis) {
            chassisBody.addShape(
                shape,
                offset.vadd(centerOfMassAdjust),
                quaternion
            )
        }

        const vehicle = new RigidVehicle({ chassisBody })
        // const axis = [-1, -1, 1, 1]

        for (const [, { position, radius }] of wheels.entries()) {
            const shape = new Sphere(radius)
            const body = new Body({
                shape,
                mass: mass * .65,
                angularDamping: .99,
                allowSleep: false,
                quaternion: rotation,
            })

            vehicle.addWheel({
                body,
                position: new Vec3(
                    position[0] + horizontalStabilityAdjust * Math.sign(position[0]),
                    position[1] + verticalStabilityAdjust,
                    position[2]
                ),
                axis: new Vec3(1, 0, 0),
                direction
            })
        }

        return [vehicle, contactMaterial]
    }, [world])

    useEffect(() => {
        vehicle.addToWorld(world)

        return () => {
            vehicle.removeFromWorld(world)
        }
    }, [vehicle, world])

    useFrame(() => {
        if (!chassisRef.current) {
            return
        }

        chassisRef.current.quaternion.copy(vehicle.chassisBody.quaternion)
        chassisRef.current.position.copy(vehicle.chassisBody.position)

        vehicle.chassisBody.quaternion.vmult(_chassisOffset.set(0, -verticalStabilityAdjust, 0), _chassisOffset)
        chassisRef.current.position.sub(_chassisOffset)

        for (const [index, wheel] of vehicle.wheelBodies.entries()) {
            const wheelMesh = wheelsRef.current?.children[index] as Mesh

            if (wheelMesh) {
                wheelMesh.quaternion.copy(wheel.quaternion)
                wheelMesh.position.copy(wheel.position)

                const side = (index + 1) % 2 === 0 ? 1 : -1

                wheel.quaternion.vmult(_wheelOffset.set(horizontalStabilityAdjust * side, 0, 0), _wheelOffset)
                wheelMesh.position.add(_wheelOffset)
            }
        }
    })

    return [chassisRef, wheelsRef, vehicle, backWheelsRef] as const
}
