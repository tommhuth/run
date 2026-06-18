import { Body, resetBody } from "@data/cannon"
import { Tuple3 } from "@src/types/global"
import { Material, Quaternion, RigidVehicle, Sphere, Vec3, World } from "cannon-es"

import type { Chassis, Wheel } from "./useRigidVehicle"

export interface VehicleSpec {
    mass: number
    chassis: Chassis
    wheels: Wheel[]
    horizontalStabilityAdjust: number
    verticalStabilityAdjust: number
    wheelMaterial: Material
    type: string
}

const _emptyOffset = new Vec3()
const _emptyQuaternion = new Quaternion()
const _quaternion = new Quaternion()
const _worldPosition = new Vec3()
const suspensionDirection = new Vec3(0, -1, 0)

const vehiclePools = new Map<Chassis, RigidVehicle[]>()
const MAX_VEHICLE_PER_TYPE = 6

// Per-vehicle wheel offsets (local to chassis), needed to reposition wheel
// bodies on reset exactly where the constraint expects them.
const wheelOffsets = new WeakMap<RigidVehicle, Vec3[]>()

// cannon-es RigidVehicle.addToWorld registers its preStep listener via
// `this._update.bind(this)` (a fresh function every call) and removeFromWorld
// never removes it. Because vehicles are pooled and re-added on every reset,
// that leaks a listener per reuse, applying wheel forces N times per step.
// We keep a single stable listener per vehicle and manage it ourselves.
const wheelForceUpdaters = new WeakMap<RigidVehicle, () => void>()

function getWheelForceUpdater(vehicle: RigidVehicle) {
    let updater = wheelForceUpdaters.get(vehicle)

    if (!updater) {
        updater = (vehicle as unknown as { _update: () => void })._update.bind(vehicle)
        wheelForceUpdaters.set(vehicle, updater)
    }

    return updater
}

function createVehicle(
    {
        mass,
        chassis,
        wheels,
        horizontalStabilityAdjust,
        verticalStabilityAdjust,
        wheelMaterial,
        type,
    }: VehicleSpec,
    position: Tuple3,
    rotation: Tuple3
) {
    const quaternion = new Quaternion().setFromEuler(...rotation)
    const centerOfMassAdjust = new Vec3(0, verticalStabilityAdjust, 0)
    const chassisBody = new Body({
        mass,
        position: new Vec3(...position),
        quaternion,
        allowSleep: false,
    })

    for (const [shape, offset = _emptyOffset, q = _emptyQuaternion] of chassis) {
        chassisBody.addShape(shape, offset.vadd(centerOfMassAdjust), q)
    }

    const vehicle = new RigidVehicle({ chassisBody })

    chassisBody.userData = { type }

    const offsets: Vec3[] = []

    for (const { position: wheelPosition, radius } of wheels) {
        const shape = new Sphere(radius)
        const body = new Body({
            shape,
            mass: mass * .65,
            material: wheelMaterial,
            angularDamping: .9,
            allowSleep: false,
            quaternion,
        })
        const offset = new Vec3(
            wheelPosition[0] + horizontalStabilityAdjust * Math.sign(wheelPosition[0]),
            wheelPosition[1] + verticalStabilityAdjust,
            wheelPosition[2]
        )

        offsets.push(offset)

        vehicle.addWheel({
            body,
            position: offset,
            axis: new Vec3(1, 0, 0),
            direction: suspensionDirection,
        })
    }

    wheelOffsets.set(vehicle, offsets)

    return vehicle
}

// Restore a pooled vehicle to the same clean state a freshly constructed one
// would have: zeroed motion/forces, reset interpolation history, neutral
// steering and drive force.
function resetVehicle(vehicle: RigidVehicle, position: Tuple3, rotation: Tuple3) {
    const chassis = vehicle.chassisBody
    const offsets = wheelOffsets.get(vehicle) as Vec3[]

    _quaternion.setFromEuler(...rotation)
    resetBody(chassis, ...position, _quaternion)

    for (let index = 0; index < vehicle.wheelBodies.length; index++) {
        chassis.pointToWorldFrame(offsets[index], _worldPosition)

        resetBody(vehicle.wheelBodies[index], _worldPosition.x, _worldPosition.y, _worldPosition.z, _quaternion)

        vehicle.setSteeringValue(0, index)
        vehicle.setWheelForce(0, index)
    }
}

export function acquireVehicle(spec: VehicleSpec, position: Tuple3, rotation: Tuple3) {
    const vehicles = vehiclePools.get(spec.chassis)

    if (vehicles && vehicles.length > 0) {
        // we have existing vehicles to reuse, get one
        const vehicle = vehicles.pop() as RigidVehicle

        resetVehicle(vehicle, position, rotation)

        return vehicle
    }

    return createVehicle(spec, position, rotation)
}

export function releaseVehicle(chassis: Chassis, vehicle: RigidVehicle) {
    let vehicles = vehiclePools.get(chassis)

    if (!vehicles) {
        // nothing for that vehicle type, init empty list
        vehicles = []
        vehiclePools.set(chassis, vehicles)
    }

    if (vehicles.length < MAX_VEHICLE_PER_TYPE) {
        // push vehicle to list for reuse
        vehicles.push(vehicle)
    }
}

// Add the vehicle to the world with a single, stable preStep listener so reused
// vehicles never accumulate duplicate wheel-force updaters.
export function addVehicleToWorld(world: World, vehicle: RigidVehicle) {
    for (const body of vehicle.wheelBodies) {
        world.addBody(body)
    }

    world.addBody(vehicle.chassisBody)

    for (const constraint of vehicle.constraints) {
        world.addConstraint(constraint)
    }

    world.addEventListener("preStep", getWheelForceUpdater(vehicle))
}

export function removeVehicleFromWorld(world: World, vehicle: RigidVehicle) {
    for (const body of vehicle.wheelBodies) {
        world.removeBody(body)
    }

    world.removeBody(vehicle.chassisBody)

    for (const constraint of vehicle.constraints) {
        world.removeConstraint(constraint)
    }

    world.removeEventListener("preStep", getWheelForceUpdater(vehicle))
}
