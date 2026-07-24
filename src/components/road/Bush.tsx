import model from "@assets/models/bush.glb"
import { aoLayers } from "@components/Instances"
import { setMatrixAt } from "@components/materials/helpers"
import { leafMaterial } from "@components/materials/shared"
import { useLowerPriorityFrame } from "@data/hooks/utils"
import QuaternionSpring from "@data/QuaternionSpring"
import { spawnLeaves } from "@data/store/actions/leaves"
import { BushObject, useStore } from "@data/store/store"
import { clamp, ndelta } from "@data/utils"
import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { GLTFModel, Tuple3 } from "@src/types/global"
import { useMemo, useRef } from "react"
import { Euler, InstancedMesh, Quaternion, Vector3 } from "three"

const _tmpVec = new Vector3()
const _tmpVec2 = new Vector3()
const _tmpVec3 = new Vector3()
const _tmpQuat = new Quaternion()
const _targetQuat = new Quaternion()
const _up = new Vector3(0, 1, 0)
const _playerPosition = new Vector3()
const _lookAhead = new Vector3()
const _euler = new Euler()
const _bushPosition = new Vector3()

interface BushInstance {
    position: Tuple3
    radius: number
    height: number
    rotation: Tuple3
    bendStrength: number
    maxBend: number
    baseRotation: Quaternion
    spring: QuaternionSpring
}

export default function Bushes({
    position,
    count
}: Omit<BushObject, "id">) {
    const ref = useRef<InstancedMesh>(null)
    const hasTriggeredLeaves = useRef<Record<number, boolean>>({})
    const firstFrame = useRef(true)
    const { nodes } = useGLTF(model) as unknown as GLTFModel<["bush"]>
    const bushes = useMemo(() => {
        const baseRotation = .2 / 2
        const radius = random.float(.5, 1.5)
        const height = random.float(radius * 4, radius * 3)
        const centerRotation: Tuple3 = [
            random.float(-baseRotation, baseRotation),
            random.float(0, Math.PI * 2),
            random.float(-baseRotation, baseRotation),
        ]
        const centerBaseQuat = new Quaternion()
            .setFromEuler(_euler.set(...centerRotation))
        const center: BushInstance = {
            position,
            radius,
            height,
            rotation: centerRotation,
            bendStrength: 1,
            maxBend: random.float(.2, .4),
            baseRotation: centerBaseQuat,
            spring: new QuaternionSpring(40, 4, centerBaseQuat),
        }

        const ring: BushInstance[] = Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * Math.PI * 2 + random.float(-.25, .25)
            const r2 = random.float(.5, 1.5)
            const r = center.radius + r2

            const rot: Tuple3 = [
                random.float(-baseRotation, baseRotation),
                random.float(0, Math.PI * 2),
                random.float(-baseRotation, baseRotation),
            ]
            const baseQuat = new Quaternion().setFromEuler(_euler.set(...rot))

            return {
                position: [
                    position[0] + Math.cos(angle) * r,
                    position[1],
                    position[2] + Math.sin(angle) * r,
                ] as Tuple3,
                radius: r2,
                height: random.float(r2, r2 * 2),
                rotation: rot,
                bendStrength: 1,
                maxBend: random.float(.3, .45),
                baseRotation: baseQuat,
                spring: new QuaternionSpring(random.float(35, 45), random.float(4, 8), baseQuat),
            }
        })

        return [center, ...ring]
    }, [])

    useLowerPriorityFrame(() => {
        const player = useStore.getState().player.vehicle
        const threshold = 3

        if (!player) {
            return
        }

        for (let i = 0; i < bushes.length; i++) {
            const bush = bushes[i]
            const dist = _bushPosition.set(...bush.position)
                .distanceToSquared(player.chassisBody.position)

            if (dist < threshold) {
                if (!hasTriggeredLeaves.current[i]) {
                    hasTriggeredLeaves.current[i] = true
                    spawnLeaves({
                        position: [
                            bush.position[0],
                            bush.position[1] + bush.height / 2,
                            bush.position[2]
                        ],
                        size: [bush.radius * 2, bush.height, bush.radius * 2],
                        count: Math.ceil(bush.radius * 30),
                        spread: [1, 1, 1],
                        velocity: player.chassisBody.velocity.toArray()
                    })
                }
            } else {
                hasTriggeredLeaves.current[i] = false
            }
        }
    }, 166)

    useFrame((_, delta) => {
        const player = useStore.getState().player.vehicle

        if (!player || !ref.current) {
            return
        }

        const dt = ndelta(delta)
        const lookAhead = .25
        const playerSpeed = player.chassisBody.velocity.length()
        const activeThreshold = 10

        _lookAhead.copy(player.chassisBody.velocity)
            .multiplyScalar(lookAhead)
        // shift player position forward along its velocity so bushes start
        // bending before being reached (eg. at 20 m/s, anticipates by ~5m)
        _playerPosition.copy(player.chassisBody.position)
            .add(_lookAhead)

        for (let index = 0; index < bushes.length; index++) {
            const bush = bushes[index]
            const distanceToPlayer = Math.abs(player.chassisBody.position.z - bush.position[2])

            if (distanceToPlayer > activeThreshold && !firstFrame.current) {
                continue
            }

            _bushPosition.set(...bush.position)
            _tmpVec.copy(_playerPosition)
                .sub(_bushPosition)

            const distanceFromFocus = _tmpVec.length()

            if (distanceFromFocus > 0) {
                _tmpVec.normalize()
                _tmpVec2.copy(_tmpVec)
                    .negate()
                    .setComponent(1, 1 - bush.maxBend)

                if (_tmpVec2.lengthSq() > 0) {
                    _tmpVec2.normalize()

                    const maxBendDistance = 1.5
                    // speed boost: faster player => deeper bend,
                    // so that the effect is visible when travelling fast
                    const speedBoost = 1 + clamp(playerSpeed / 15) * 2
                    // amount of bend affecting current bush
                    const proximity = clamp((1 - distanceFromFocus / maxBendDistance) * speedBoost)
                        * bush.bendStrength

                    // target direction: blend from up to horizontal away direction
                    // with clamped y maxBend
                    _tmpVec3.copy(_up)
                        .lerp(_tmpVec2, proximity)
                        .normalize()

                    // compute target quaternion, rotate up toward target direction,
                    // and add in base rotation
                    _tmpQuat.setFromUnitVectors(_up, _tmpVec3)
                    _targetQuat.copy(bush.baseRotation)
                        .premultiply(_tmpQuat)

                    bush.spring.update(_targetQuat, dt)
                }
            }

            setMatrixAt({
                instance: ref.current,
                index,
                position: bush.position,
                rotation: bush.spring.current,
                scale: [bush.radius * 2, bush.height, bush.radius * 2],
            })
        }

        firstFrame.current = false
    })

    return (
        <instancedMesh
            ref={ref}
            args={[nodes.bush.geometry, leafMaterial, count]}
            frustumCulled={false}
            castShadow
            receiveShadow
            layers={aoLayers}
        />
    )
}

useGLTF.preload(model)
