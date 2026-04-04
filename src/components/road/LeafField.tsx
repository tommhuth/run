import model from "@assets/models/leaf.glb"
import { setMatrixAt } from "@components/materials/helpers"
import { leafMaterial } from "@components/materials/shared"
import { useStore } from "@data/store"
import { clamp, dampFactor, ndelta } from "@data/utils"
import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { GLTFModel, Tuple3 } from "@src/types/global"
import { useMemo, useRef } from "react"
import { Euler, InstancedMesh, Quaternion, Vector3 } from "three"

useGLTF.preload(model)

type Leaf = {
    id: string
    baseRotation: Quaternion
    targetRotation: Quaternion
    rotation: Quaternion
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
const tmpVec4 = new Vector3()
const tmpQuat = new Quaternion()
const up = new Vector3(0, 1, 0)

// https://chatgpt.com/c/6998c583-8144-832a-a5d0-9c8627acd565
function rotate(leaf: Leaf, target: Vector3, dt: number, time: number) {
    // 1. direction to target
    tmpVec.copy(target)
        .sub(leaf.position)
    const dist = tmpVec.length()

    if (dist === 0) {
        return
    }

    tmpVec.normalize() // toTarget

    // 2. horizontal direction (XZ only) and negate to bend away
    tmpVec2.copy(tmpVec)
        .negate()
        .setComponent(1, .35)

    if (tmpVec2.lengthSq() === 0) {
        return
    }

    tmpVec2.normalize() // horizontalDir

    const maxDist = 2.5
    // 3. distance-based blend
    const t = clamp(1 - dist / maxDist, 0, 1) * 10 + 4

    // 4. blend vertical → horizontal into targetDir
    tmpVec3.copy(up)
        .lerp(tmpVec2, dampFactor(t, dt))
        .normalize()

    // 
    const windStrength = .2
    const windFrequency = 1.15

    tmpVec3.x += Math.cos((leaf.position.x + leaf.position.z) * .3 + time * windFrequency) * windStrength
    tmpVec3.z += Math.cos((leaf.position.x + leaf.position.z) * .3 + time * windFrequency) * windStrength

    tmpVec3.x += Math.cos((leaf.position.x + leaf.position.z) * .5 + time * windFrequency * 4) * windStrength * .05
    tmpVec3.z += Math.cos((leaf.position.x + leaf.position.z) * .5 + time * windFrequency * 4) * windStrength * .05

    // 5. compute quaternion to rotate Y to targetDir
    // rotating the base orientation of the leaf so its local Y axis aligns with the blended direction
    tmpQuat.setFromUnitVectors(up, tmpVec3)

    // apply new rotation to base rotation
    leaf.targetRotation.copy(leaf.baseRotation)
        .premultiply(tmpQuat)

    // --- spring rotation ---
    const current = leaf.rotation

    // delta quaternion
    tmpQuat.copy(current)
        .invert()
        .multiply(leaf.targetRotation)

    const angle = 2 * Math.acos(clamp(tmpQuat.w, -1, 1))

    if (angle < 1e-4) {
        return
    }

    tmpVec.set(tmpQuat.x, tmpQuat.y, tmpQuat.z)
        .normalize() // axis

    // spring acceleration
    tmpVec.multiplyScalar(angle * leaf.stiffness)

    // integrate velocity
    leaf.angularVelocity.addScaledVector(tmpVec, dt)

    // damping
    leaf.angularVelocity.multiplyScalar(Math.exp(-leaf.damping * dt))

    // apply rotation
    const speed = leaf.angularVelocity.length()

    if (speed > 0) {
        tmpVec4.copy(leaf.angularVelocity)
            .normalize()
        tmpQuat.setFromAxisAngle(tmpVec4, speed * dt)
        leaf.rotation.multiply(tmpQuat)
            .normalize()
    }
}

function easeOutQuad(x: number): number {
    return 1 - (1 - x) * (1 - x)
}

function easeInQuad(x: number): number {
    return x * x
}

const _playerPosition = new Vector3()
const _lookAhead = new Vector3()
const _euler = new Euler()

interface LeafFieldProps {
    position: Tuple3
    depth?: number
    width?: number
    interval?: number
    randomness?: number
}

export default function LeafField({
    position,
    depth = 15,
    width = 10,
    interval = 2,
    randomness = 2
}: LeafFieldProps) {
    const leaves = useMemo(() => {
        let index = 0

        return Array.from({ length: Math.ceil(width / interval) }).map((i, x, xlist) => {
            return Array.from({ length: Math.ceil(depth / interval) }).map((j, z, zlist) => {
                const baseRotation = new Quaternion().setFromEuler(
                    _euler.set(
                        random.float(-.5, .5),
                        random.float(0, Math.PI * 2),
                        0,
                    )
                )
                const horizontalDirection = Math.sign(position[0])
                const offset = -horizontalDirection * Math.cos((z / (zlist.length - 1)) * Math.PI * 2) * 1.5
                const easer = horizontalDirection === 1 ? easeInQuad : easeOutQuad
                const scaler = easer(x / (xlist.length - 1))

                return {
                    id: random.id(),
                    baseRotation,
                    targetRotation: baseRotation.clone(),
                    rotation: baseRotation.clone(),
                    index: index++,
                    scale: clamp(horizontalDirection === 1 ? scaler : 1 - scaler, .25, 1) + random.float(0, .75),
                    stiffness: random.float(35, 45),
                    damping: random.float(.75, 2),
                    angularVelocity: new Vector3(),
                    position: new Vector3(
                        x * interval + random.float(-randomness, randomness) - width / 2 + offset + position[0],
                        0,
                        z * interval + random.float(-randomness, randomness) - depth / 2 + position[2],
                    )
                } satisfies Leaf
            })
        }).flat(1)
    }, [])
    const { nodes } = useGLTF(model) as unknown as GLTFModel<["leaf1"]>
    const instanceRef = useRef<InstancedMesh>(null)

    useFrame(({ clock }, delta) => {
        const player = useStore.getState().player.vehicle

        if (!player || !instanceRef.current) {
            return
        }

        const lookAhead = .1

        _lookAhead.copy(player.chassisBody.velocity)
            .multiplyScalar(lookAhead)
        _playerPosition.copy(player.chassisBody.position)
            .add(_lookAhead)

        for (const leaf of leaves) {
            const updateThreshold = 30
            const isClose = Math.abs(_playerPosition.z - leaf.position.z) < updateThreshold

            if (isClose) {
                rotate(leaf, _playerPosition, ndelta(delta), clock.getElapsedTime())
            }

            setMatrixAt({
                position: leaf.position.toArray(),
                rotation: leaf.rotation.toArray(),
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
