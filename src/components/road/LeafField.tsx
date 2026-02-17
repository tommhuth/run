import model from "@assets/models/leaf.glb"
import { setMatrixAt } from "@components/materials/helpers"
import { leafMaterial } from "@components/materials/shared"
import { useStore } from "@data/store"
import { clamp } from "@data/utils"
import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { useMemo, useRef } from "react"
import { Euler, InstancedMesh, Quaternion, Vector3 } from "three"

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


// thanks chatgpt
// https://chatgpt.com/c/698dfd6c-8bf0-8332-b9b7-cdebab78fd8c
// bends leaf with anchorpoint center bottom of mesh, to rotate away from
// player position
function updateLeaf(
    leaf: Leaf,
    playerPosition: Vector3,
    playerVelocity: Vector3,
    dt: number,
    time: number
) {
    const MAX_BEND = Math.PI * 0.375
    const WIND_STRENGTH = 0.4
    const WIND_FREQ = 1.1
    const pushRadius = 1.75
    const pushRadiusSq = pushRadius * pushRadius
    const pushStrength = .35

    // ----- player push -----
    const toLeaf = tmpVec.subVectors(leaf.position, playerPosition)
    const distSq = toLeaf.lengthSq()

    if (distSq < pushRadiusSq) {

        const invDist = 1 / Math.sqrt(distSq + 1e-6)
        const outward = toLeaf.multiplyScalar(invDist)

        // radial velocity toward leaf
        const radialVel = playerVelocity.dot(outward)

        if (radialVel > 0) {

            // stem dir (cached per leaf ideally)
            const stemDir = tmpVec2
                .set(0, 1, 0)
                .applyQuaternion(leaf.restQuaternion)

            // remove vertical component -> bend plane
            const proj = tmpVec3.copy(outward)

            proj.addScaledVector(stemDir, -proj.dot(stemDir))

            const torqueAxis = stemDir.cross(proj)

            const falloff = 1 - Math.sqrt(distSq) / pushRadius

            leaf.angularVelocity.addScaledVector(
                torqueAxis,
                pushStrength * radialVel * falloff
            )
        }
    }

    // ----- wind -----
    const t = time * WIND_FREQ + leaf.position.x * 0.7

    tmpVec.set(Math.sin(t), 0, Math.cos(t * 0.9))
    leaf.angularVelocity.addScaledVector(tmpVec, WIND_STRENGTH * dt)

    // ----- spring -----
    tmpQuat.copy(leaf.restQuaternion).invert().multiply(leaf.quaternion)
    tmpVec.set(tmpQuat.x, tmpQuat.y, tmpQuat.z)
    leaf.angularVelocity.addScaledVector(tmpVec, -leaf.stiffness * dt)
    leaf.angularVelocity.multiplyScalar(Math.exp(-leaf.damping * dt))

    // ----- integrate -----
    tmpQuat.set(
        leaf.angularVelocity.x * dt,
        leaf.angularVelocity.y * dt,
        leaf.angularVelocity.z * dt,
        1
    ).normalize()

    leaf.quaternion.multiply(tmpQuat)

    // ----- clamp (fast early out) -----
    tmpQuat.copy(leaf.restQuaternion).invert().multiply(leaf.quaternion)

    if (tmpQuat.w < Math.cos(MAX_BEND * 0.5)) {

        const axisLen = Math.sqrt(1 - tmpQuat.w * tmpQuat.w)

        if (axisLen > 1e-4) {

            tmpVec.set(
                tmpQuat.x / axisLen,
                tmpQuat.y / axisLen,
                tmpQuat.z / axisLen
            )

            tmpQuat.setFromAxisAngle(tmpVec, MAX_BEND)
            leaf.quaternion.copy(leaf.restQuaternion).multiply(tmpQuat)
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

interface LeafFieldProps {
    position: Tuple3
    depth?: number
    width?: number
    interval?: number
    randomness?: number
}

export default function LeafField({
    position,
    depth = 14,
    width = 6,
    interval = 1.25,
    randomness = .75
}: LeafFieldProps) {
    const leaves = useMemo(() => {
        let index = 0

        return Array.from({ length: Math.ceil(width / interval) }).map((i, x, xlist) => {
            return Array.from({ length: Math.ceil(depth / interval) }).map((i, z, zlist) => {
                const restQuaternion = new Quaternion().setFromEuler(
                    _euler.set(
                        random.float(-.5, .5),
                        random.float(0, Math.PI * 2),
                        0,
                    )
                )
                const horizontalDirection = Math.sign(position[0])
                const offset = -horizontalDirection * Math.cos((z / (zlist.length - 1)) * Math.PI * 2) * 1
                const easer = horizontalDirection === 1 ? easeInQuad : easeOutQuad
                const scaler = easer(x / (xlist.length - 1))

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
                        x * interval + random.float(-randomness, randomness) - width / 2 + offset + position[0],
                        0,
                        z * interval + random.float(-randomness, randomness) - depth / 2 + position[2],
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
            const updateThreshold = 15
            const isClose = Math.abs(_playerPosition.z - leaf.position.z) < updateThreshold

            if (isClose) {
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
