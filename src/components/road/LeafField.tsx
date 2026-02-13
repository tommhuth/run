import model from "@assets/models/leaf.glb"
import { setMatrixAt } from "@components/materials/helpers"
import { leafMaterial } from "@components/materials/shared"
import { useStore } from "@data/store"
import { clamp } from "@data/utils"
import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import { Euler, InstancedMesh, MathUtils, Quaternion, Vector3 } from "three"

useGLTF.preload(model)

type Leaf = {
    id: string
    restQuaternion: Quaternion
    quaternion: Quaternion
    position: Vector3
    index: number
    scale: number
    angularVelocity: Vector3
    stiffness: number
    damping: number
}

const tmpVec = new Vector3()
const tmpVec2 = new Vector3()
const tmpVec3 = new Vector3()
const tmpQuat = new Quaternion()

const MAX_BEND = Math.PI * 0.5 * .75
const WIND_STRENGTH = 0.15
const WIND_FREQ = 1.5

// thanks chatgpt
// https://chatgpt.com/c/698dfd6c-8bf0-8332-b9b7-cdebab78fd8c
function updateLeaf(
    leaf: Leaf,
    playerPos: Vector3,
    playerVel: Vector3,
    dt: number,
    time: number
) {
    const pushRadius = 1.75
    const pushStrength = .35

    const leafPos = tmpVec.copy(leaf.position)
    const toLeaf = tmpVec2.subVectors(leafPos, playerPos)
    const dist = toLeaf.length()

    if (dist < pushRadius && playerVel.lengthSq() > 0.0001) {

        const outward = toLeaf.normalize()

        // Only if moving toward leaf
        const velDir = tmpVec3.copy(playerVel).normalize()
        const toward = velDir.dot(outward)

        if (toward > 0) {

            const speed = playerVel.length()

            // Stem direction (local Y axis in world space)
            const stemDir = tmpVec
                .set(0, 1, 0)
                .applyQuaternion(leaf.restQuaternion)
                .normalize()

            // Project outward direction onto bend plane
            const projected = tmpVec2
                .copy(outward)
                .projectOnPlane(stemDir)
                .normalize()

            // Torque axis = stem × projected force
            const torqueAxis = tmpVec3
                .crossVectors(stemDir, projected)
                .normalize()

            leaf.angularVelocity.addScaledVector(
                torqueAxis,
                pushStrength *
                speed *
                toward *
                (1 - dist / pushRadius)
            )
        }
    }

    // --- wind ---
    const t = time * WIND_FREQ + leaf.position.x * 0.7

    tmpVec.set(Math.sin(t), 0, Math.cos(t * 0.9))
    leaf.angularVelocity.addScaledVector(tmpVec, WIND_STRENGTH * dt)

    // --- spring ---
    tmpQuat
        .copy(leaf.restQuaternion)
        .invert()
        .multiply(leaf.quaternion)

    tmpVec.set(tmpQuat.x, tmpQuat.y, tmpQuat.z)

    leaf.angularVelocity.addScaledVector(
        tmpVec,
        -leaf.stiffness * dt
    )

    leaf.angularVelocity.multiplyScalar(
        Math.exp(-leaf.damping * dt)
    )

    // --- integrate ---
    tmpQuat
        .set(
            leaf.angularVelocity.x * dt,
            leaf.angularVelocity.y * dt,
            leaf.angularVelocity.z * dt,
            1
        )
        .normalize()

    leaf.quaternion.multiply(tmpQuat)

    // --- clamp ---
    tmpQuat
        .copy(leaf.restQuaternion)
        .invert()
        .multiply(leaf.quaternion)

    const angle = 2 * Math.acos(
        MathUtils.clamp(tmpQuat.w, -1, 1)
    )

    if (angle > MAX_BEND) {
        const axisLen = Math.sqrt(1 - tmpQuat.w * tmpQuat.w)

        if (axisLen > 0.0001) {
            tmpVec.set(
                tmpQuat.x / axisLen,
                tmpQuat.y / axisLen,
                tmpQuat.z / axisLen
            )

            tmpQuat.setFromAxisAngle(tmpVec, MAX_BEND)

            leaf.quaternion
                .copy(leaf.restQuaternion)
                .multiply(tmpQuat)

            leaf.angularVelocity.multiplyScalar(0.3)
        }
    }
}

function easeOutQuad(x: number): number {
    return 1 - (1 - x) * (1 - x)
}

function easeInQuad(x: number): number {
    return x * x
}

const _playerPosition = new Vector3()
const _playerVelocity = new Vector3()
const _euler = new Euler()

export default function LeafField({
    position,
    depth = 14,
    width = 6,
    interval = .9,
    randomness = .75
}) {
    const leaves = useMemo(() => {
        let index = 0

        return Array.from({ length: Math.ceil(width / interval) }).map((i, x) => {
            return Array.from({ length: Math.ceil(depth / interval) }).map((i, z) => {
                const restQuaternion = new Quaternion().setFromEuler(
                    _euler.set(
                        random.float(.1, .5) * random.pick(-1, 1),
                        random.float(0, Math.PI * 2),
                        0,
                    )
                )
                const horizontalDirection = Math.sign(position[0])
                const offset = -horizontalDirection * Math.cos((z / (depth - 1)) * Math.PI * 2) * 1
                const easer = horizontalDirection === 1 ? easeInQuad : easeOutQuad
                const scaler = easer(x / (width - 1))

                return {
                    id: random.id(),
                    restQuaternion,
                    quaternion: new Quaternion().copy(restQuaternion),
                    index: index++,
                    scale: clamp(horizontalDirection === 1 ? scaler : 1 - scaler, .25, 2) + random.float(0, .75),
                    stiffness: random.float(12, 18),
                    damping: random.float(1, 4),
                    angularVelocity: new Vector3(),
                    position: new Vector3(
                        x * interval + random.float(-randomness, randomness) + position[0] - width / 2 + offset,
                        0,
                        z * interval + random.float(-randomness, randomness) + position[2] - depth / 2,
                    )
                } satisfies Leaf
            })
        }).flat(1)
    }, [])
    const { nodes } = useGLTF(model)
    const instanceRef = useRef<InstancedMesh>(null)

    useFrame(({ clock }, delta) => {
        const player = useStore.getState().player.vehicle

        if (!player || !instanceRef.current) {
            return
        }

        _playerPosition.copy(player.chassisBody.position)
        _playerVelocity.copy(player.chassisBody.velocity)

        const time = clock.getElapsedTime()

        for (const leaf of leaves) {
            const updateThreshold = 10

            if (Math.abs(_playerPosition.z - leaf.position.z) < updateThreshold) {
                updateLeaf(leaf, _playerPosition, _playerVelocity, delta, time)
            }

            setMatrixAt({
                position: leaf.position.toArray(),
                rotation: leaf.quaternion.toArray(),
                scale: leaf.scale,
                index: leaf.index,
                instance: instanceRef.current
            })
        }
    })

    return (
        <instancedMesh
            args={[nodes.leaf1.geometry, leafMaterial, leaves.length]}
            ref={instanceRef}
            frustumCulled={false}
            castShadow
            receiveShadow
        />
    )
}
