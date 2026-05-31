import { CollisionEvent, useCannonWorld } from "@data/cannon"
import { dampFactor, ndelta } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { Body, Quaternion, RigidVehicle, Shape, Sphere, Vec3 } from "cannon-es"
import { RefObject, useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { Group, Mesh, Object3D, Quaternion as ThreeQuaternion } from "three"

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

const _emptyOffset = new Vec3()
const _wheelOffset = new Vec3()
const _chassisOffset = new Vec3()
const _emptyQuaternion = new Quaternion()
const _quaternion = new ThreeQuaternion()

const direction = new Vec3(0, -1, 0)

export const wheelKey = ["wheel-front-left", "wheel-front-right", "wheel-back-left", "wheel-back-right"]

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
    const vk = dampFactor(18, delta)

    chassisMesh.quaternion.slerp(_quaternion.copy(vehicle.chassisBody.quaternion), qk)

    if (mode === "lerp") {
        chassisMesh.position.lerp(vehicle.chassisBody.position, vk)
    } else {
        chassisMesh.position.copy(vehicle.chassisBody.position)
    }

    vehicle.chassisBody.quaternion.vmult(_chassisOffset.set(0, -verticalStabilityAdjust, 0), _chassisOffset)
    chassisMesh.position.sub(_chassisOffset)

    for (const [index, wheel] of vehicle.wheelBodies.entries()) {
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
    const [vehicle] = useMemo(() => {
        const rotation = new Quaternion().setFromEuler(...incomingRotation)
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

        chassisBody.userData = { type }

        for (const [, { position, radius }] of wheels.entries()) {
            const shape = new Sphere(radius)
            const body = new Body({
                shape,
                mass: mass * .65,
                material: materials.wheel,
                angularDamping: .9,
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

        return [vehicle]
    }, [world, ...deps])

    useEffect(() => {
        vehicle.addToWorld(world)


        return () => {
            vehicle.removeFromWorld(world)
        }
    }, [vehicle, world])

    useEffect(() => {
        const onCollide = (e: CollisionEvent) => {
            if (type === "player" && e.body.userData?.type === "traffic") {
                //let dir = vehicle.chassisBody.position.clone().vsub(e.body.position).unit()

                //dir.y += .25
                //e.body.velocity.setZero()
                //e.body.torque.setZero()
                // e.body.applyLocalForce(dir.scale(30))
            }
        }

        vehicle.chassisBody.addEventListener("collide", onCollide)

        return () => {
            vehicle.chassisBody.removeEventListener("collide", onCollide)
        }
    }, [])

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
