import { useCannonWorld } from "@data/cannon"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { Body, ContactMaterial, Material, Quaternion, RigidVehicle, Shape, Sphere, Vec3 } from "cannon-es"
import { useEffect, useMemo, useRef } from "react"
import { Euler, Group, Mesh, Quaternion as TQuaternion } from "three"


export type Chassis = [Shape, Vec3?, Quaternion?][]
export type Wheel = { radius: number; position: Tuple3 }

interface UseRigidVehicleParams {
    mass: number
    chassis: Chassis
    wheels: Wheel[]
    position?: Tuple3
    rotation?: Tuple3
    center?: Tuple3
}

const _quaternion = new TQuaternion()
const _euler = new Euler()

export function useRigidVehicle({
    position = [0, 0, 0],
    rotation: incomingRotation = [0, 0, 0],
    center = [0, -5, 0],
    mass,
    chassis = [],
    wheels
}: UseRigidVehicleParams) {
    const chassisRef = useRef<Group>(null)
    const wheelsRef = useRef<Group>(null)
    const backWheelsRef = useRef<Group>(null)
    const centerOfMassAdjust = new Vec3(...center)
    const world = useCannonWorld()
    const [vehicle, contactMaterial] = useMemo(() => {
        const rotation = new Quaternion().setFromEuler(...incomingRotation)
        const material = new Material("wheelMaterial")
        const contactMaterial = new ContactMaterial(material, world.defaultMaterial, {
            friction: .85,
            restitution: .1,
            contactEquationStiffness: 1000
        })
        const chassisBody = new Body({
            mass,
            position: position ? new Vec3(...position) : undefined,
            quaternion: rotation,
            allowSleep: false,
        })
        const emptyOffset = new Vec3()
        const emptyQuaternion = new Quaternion()

        for (const [shape, offset = emptyOffset, quaternion = emptyQuaternion] of chassis) {
            chassisBody.addShape(
                shape,
                offset.vadd(centerOfMassAdjust),
                quaternion
            )
        }

        const vehicle = new RigidVehicle({ chassisBody })
        const direction = new Vec3(0, -1, 0) // down
        const axis = [-1, -1, 1, 1]

        for (const [index, { position, radius }] of wheels.entries()) {
            const shape = new Sphere(radius)
            const body = new Body({
                shape,
                mass,
                material,
                angularDamping: .99,
                allowSleep: false,
                quaternion: rotation,
            })

            vehicle.addWheel({
                body,
                position: new Vec3(...position).vadd(centerOfMassAdjust),
                axis: new Vec3(axis[index], 0, 0),
                direction
            })
        }

        return [vehicle, contactMaterial]
    }, [world])

    useEffect(() => {
        vehicle.addToWorld(world)
        world.addContactMaterial(contactMaterial)

        return () => {
            vehicle.removeFromWorld(world)
            world.removeContactMaterial(contactMaterial)
        }
    }, [vehicle, world])

    useFrame(() => {
        if (!chassisRef.current) {
            return
        }

        chassisRef.current.quaternion.copy(vehicle.chassisBody.quaternion)
        chassisRef.current.position.copy(vehicle.chassisBody.position)

        for (const [index, wheel] of vehicle.wheelBodies.entries()) {
            const wheelMesh = wheelsRef.current?.children[index] as Mesh
            const backWheelMesh = backWheelsRef.current?.children[index - 2]

            if (wheelMesh) {
                wheelMesh?.position.copy(wheel.position)
                wheelMesh?.quaternion.copy(wheel.quaternion)
            } else if (backWheelMesh) {
                _quaternion.set(...wheel.quaternion.toArray())
                _euler.setFromQuaternion(_quaternion, "XYZ")

                backWheelMesh.rotation.x = _euler.x
            }
        }
    })

    return [chassisRef, wheelsRef, vehicle, backWheelsRef] as const
}
