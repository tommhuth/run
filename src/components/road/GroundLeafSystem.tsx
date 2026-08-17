import { setMatrixAt } from "@components/materials/helpers"
import { leafMaterial } from "@components/materials/shared"
import { Client, SpatialHashGrid2D } from "@data/SpatialHashGrid2D"
import { ForestPart, RoadPart, store } from "@data/store/store"
import { dampFactor, map, ndelta } from "@data/utils"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { useMemo, useState } from "react"
import { Euler, InstancedMesh, Quaternion, Vector3 } from "three"

import { ROAD_HEIGHT, ROAD_SLOPE_ANGLE } from "./const"
import { leafGeometry } from "./LeafSystem"

const VEHICLE_SEARCH_SIZE: [number, number] = [5, 5]
const VEHICLE_HIT_RADIUS = 1.25
const VEHICLE_HIT_LIFT_VELOCITY = .7
const VEHICLE_HIT_COOLDOWN = 2
const HEIGHT_OFFSET = .01

const LEAF_VELOCITY_X = 1
const LEAF_VELOCITY_Y = .1
const LEAF_VELOCITY_Z = .4

// temps used inside useFrame to avoid allocations
const _flat = new Quaternion()
const _spin = new Quaternion()
const _slope = new Quaternion()
const _final = new Quaternion()
const _euler = new Euler()

function findNearestVehicle(
    grid: SpatialHashGrid2D,
    position: Vector3,
    maxRadius: number
): Client | null {
    const clients = grid.findNear(position, VEHICLE_SEARCH_SIZE)

    let nearest: Client | null = null
    let nearestDistSq = maxRadius * maxRadius

    for (const client of clients) {
        if (!client.data.vehicle) {
            continue
        }

        const [x, y, z] = client.position
        const distSq = (x - position.x) ** 2
            + (y - position.y) ** 2
            + (z - position.z) ** 2

        if (distSq < nearestDistSq) {
            nearest = client
            nearestDistSq = distSq
        }
    }

    return nearest
}

// a single euler cant do this, use quaternion instead
function getLeafRotation(
    position: Vector3,
    baseSpin: number,
    maxHeight: number
): Quaternion {
    const rotationRatio = map(position.y, maxHeight, maxHeight + .5, 1, 0)
    const airborneFactor = 1 - rotationRatio
    // flip the tilt direction for the left/right slope
    const onSlope = maxHeight > 0 && maxHeight < ROAD_HEIGHT
    // only on the sloped edge 
    const slopeZ = onSlope ? -ROAD_SLOPE_ANGLE * Math.sign(position.x) : 0
    // extra movement along z
    const tumble = airborneFactor * Math.PI * 0.5

    // rotate from xy plane to xz plane, along x + tumble along z
    _flat.setFromEuler(_euler.set(
        Math.PI * 0.5 + Math.sin(baseSpin * 1.7) * tumble,
        0,
        Math.cos(baseSpin * 1.3) * tumble,
        "XYZ"
    ))
    // spin so leaves don't all face the same way
    _spin.setFromEuler(_euler.set(0, baseSpin, 0, "XYZ"))
    // tilt around world z to match the sloped edge
    _slope.setFromEuler(_euler.set(0, 0, slopeZ, "XYZ"))

    // compose rotations = slope * sping * flat
    return _final.copy(_flat)
        .premultiply(_spin)
        .premultiply(_slope)
}

function getLeafBand(forestParts: RoadPart[]) {
    const part = random.pick(...forestParts)

    return part.position[2]
        + part.depth / 2
        + random.pick(-1, 1)
}

function biasLow(power = 4): number {
    return Math.pow(random.float(0, 1), power)
}

function biasedCenteredX(range: number, power = 4): number {
    const sign = random.pick(-1, 1)

    return sign * biasLow(power) * range
}

function resetLeaf(leaf: GroundLeaf) {
    leaf.position.x = biasedCenteredX(10) - 5
    leaf.position.y = ROAD_HEIGHT + biasLow(4) * 12
    leaf.lastTouchedAt = -Infinity
    leaf.grounded = false
    leaf.velocity.set(
        random.float(0, LEAF_VELOCITY_X),
        random.float(-LEAF_VELOCITY_Y, LEAF_VELOCITY_Y),
        random.float(-LEAF_VELOCITY_Z, LEAF_VELOCITY_Z),
    )
}

interface GroundLeaf {
    position: Vector3
    velocity: Vector3
    index: number
    grounded: boolean
    lastTouchedAt: number
    rotation: number
    scale: number
    dampingRate: number
    gravity: number
    rotationSpeed: number
}

export default function GroundLeafSystem({ count = 120 }) {
    const [instance, setInstance] = useState<InstancedMesh | null>(null)
    const items = useMemo(() => {
        const { road } = store.getState()
        const forestParts = road.filter((p): p is ForestPart => p.type === "forest")

        return Array.from({ length: count }).map((i, index) => {
            const x = biasedCenteredX(12) - 4
            const y = ROAD_HEIGHT + .25 + biasLow() * 12
            const z = getLeafBand(forestParts)

            return {
                index,
                velocity: new Vector3(
                    random.float(0, LEAF_VELOCITY_X),
                    random.float(-LEAF_VELOCITY_Y, LEAF_VELOCITY_Y),
                    random.float(-LEAF_VELOCITY_Z, LEAF_VELOCITY_Z),
                ),
                position: new Vector3(x, y, z),
                grounded: false as boolean,
                gravity: random.float(.3, .7),
                rotation: random.float(0, Math.PI * 2),
                rotationSpeed: random.float(-.85, .85),
                dampingRate: random.float(.6, 1.8),
                scale: random.float(.5, 2),
                lastTouchedAt: -Infinity,
            } satisfies GroundLeaf
        })
    }, [])

    useFrame(({ clock }, delta) => {
        const { grid, player, road } = store.getState()
        const nd = ndelta(delta)

        if (!instance || !player.vehicle) {
            return
        }


        const forwardBuffer = 35
        const potentialPositions = road.filter((part): part is ForestPart => {
            if (!player.vehicle) {
                return false
            }

            return part.position[2] > player.vehicle.chassisBody.position.z + forwardBuffer
                && part.type === "forest"
                && part.leafAnchor
        })

        for (const item of items) {
            if (item.position.z - player.vehicle.chassisBody.position.z > 60) {
                continue
            }

            const maxHeight = map(Math.abs(item.position.x), 3.04, 5.5, ROAD_HEIGHT, 0)
            const nearest = findNearestVehicle(
                grid,
                item.position,
                VEHICLE_HIT_RADIUS
            )
            const canBeTouched = clock.elapsedTime - item.lastTouchedAt > VEHICLE_HIT_COOLDOWN

            if (nearest && canBeTouched && nearest.data.vehicle) {
                //  let the closest vehicle kick it up
                const velocity = nearest.data.vehicle.chassisBody.velocity

                item.velocity.x += velocity.x * .5
                item.velocity.y += VEHICLE_HIT_LIFT_VELOCITY
                    * (Math.abs(velocity.z) > .1 ? 1 : 0)
                    + velocity.y * .25
                item.velocity.z += velocity.z * .85
                // item.position.y = Math.max(maxHeight + .01, item.position.y)
                item.grounded = false
                item.lastTouchedAt = clock.elapsedTime
            }

            if (item.grounded) {
                item.position.y = maxHeight + HEIGHT_OFFSET
            } else {
                if (clock.elapsedTime - item.lastTouchedAt < VEHICLE_HIT_COOLDOWN) {
                    const damping = 1 - dampFactor(item.dampingRate, ndelta(nd))

                    item.velocity.x *= damping
                    item.velocity.z *= damping

                    if (item.velocity.y > 0) {
                        item.velocity.z *= damping
                    }
                }

                item.velocity.y -= item.gravity * nd
                item.rotation += item.rotationSpeed * nd
                item.position.addScaledVector(item.velocity, nd)

                if (item.position.y <= maxHeight) {
                    item.position.y = maxHeight + HEIGHT_OFFSET
                    item.velocity.set(0, 0, 0)
                    item.grounded = true
                }
            }

            if (item.position.z < player.vehicle.chassisBody.position.z - 5 && potentialPositions.length) {
                // snap to a forest-part anchor ahead of the player
                item.position.z = getLeafBand(potentialPositions)
                resetLeaf(item)
            }

            setMatrixAt({
                instance,
                index: item.index,
                position: item.position,
                rotation: getLeafRotation(item.position, item.rotation, maxHeight),
                scale: item.scale,
            })
        }
    })

    return (
        <instancedMesh
            ref={setInstance}
            args={[leafGeometry, leafMaterial, count]}
            frustumCulled={false}
            castShadow
            receiveShadow
        />
    )
}
