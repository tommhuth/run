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
    let chassisRef = useRef<Group>(null)
    let wheelsRef = useRef<Group>(null)
    let backWheelsRef = useRef<Group>(null)
    let centerOfMassAdjust = new Vec3(...center)
    let world = useCannonWorld()
    let [vehicle, contactMaterial] = useMemo(() => {
        let rotation = new Quaternion().setFromEuler(...incomingRotation)
        let material = new Material("wheelMaterial")
        let contactMaterial = new ContactMaterial(material, world.defaultMaterial, {
            friction: 100,
            restitution: .1,
            contactEquationStiffness: 1000
        })
        let chassisBody = new Body({
            mass,
            position: position ? new Vec3(...position) : undefined,
            quaternion: rotation
        })
        let emptyOffset = new Vec3()
        let emptyQuaternion = new Quaternion()

        for (let [shape, offset = emptyOffset, quaternion = emptyQuaternion] of chassis) {
            chassisBody.addShape(
                shape,
                offset.vadd(centerOfMassAdjust),
                quaternion
            )
        }

        let vehicle = new RigidVehicle({ chassisBody })
        let direction = new Vec3(0, -1, 0) // down
        let axis = [-1, -1, 1, 1]

        for (let [index, { position, radius }] of wheels.entries()) {
            let shape = new Sphere(radius)
            let body = new Body({
                shape,
                mass,
                material,
                angularDamping: .99,
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
        if (!chassisRef.current || !wheelsRef.current) {
            return
        }

        chassisRef.current.quaternion.copy(vehicle.chassisBody.quaternion)
        chassisRef.current.position.copy(vehicle.chassisBody.position)

        for (let [index, wheel] of vehicle.wheelBodies.entries()) {
            let wheelMesh = wheelsRef.current?.children[index] as Mesh
            let backWheelMesh = backWheelsRef.current?.children[index - 2]

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
