import model from "@assets/models/bush.glb"
import { floorMaterial } from "@components/materials/shared"
import { useStore } from "@data/store/store"
import { clamp, ndelta } from "@data/utils"
import random from "@huth/random"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { ComponentProps, useMemo, useRef } from "react"
import { Euler, Group, Quaternion, Vector3 } from "three"

const _tmpVec = new Vector3()
const _tmpVec2 = new Vector3()
const _tmpVec3 = new Vector3()
const _tmpVec4 = new Vector3()
const _tmpQuat = new Quaternion()
const _targetQuat = new Quaternion()
const _up = new Vector3(0, 1, 0)
const _playerPosition = new Vector3()
const _lookAhead = new Vector3()
const _euler = new Euler()

interface BushProps extends ComponentProps<"group"> {
    rotation?: Tuple3
    bendStrength?: number
    maxBend?: number
    stiffness?: number
    damping?: number
    radius?: number
    height?: number
}

export default function Bushes({
    position,
    count = 4,
}: { position: Tuple3; count?: number; radius?: number }) {
    const bushes = useMemo(() => {
        const brot = .25
        const center = {
            id: random.id(),
            position: [...position] as Tuple3,
            radius: random.float(.4, .6),
            height: random.float(.8, 1.2),
            rotation: [
                random.float(-brot, brot),
                0,
                random.float(-brot, brot),
            ] as Tuple3,
        }

        const ring = Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * Math.PI * 2 + random.float(-.3, .3)
            const radius = random.float(.65, 1.25)
            const r = center.radius + .5 + random.float(-.35, .35)

            return {
                id: random.id(),
                position: [
                    position[0] + Math.cos(angle) * r,
                    position[1],
                    position[2] + Math.sin(angle) * r,
                ] as Tuple3,
                radius,
                height: random.float(.35, 1.25),
                bendStrength: 1,
                maxBend: random.float(.2, .5),
                stiffness: random.float(35, 40),
                damping: random.float(4, 6),
                rotation: [
                    random.float(-brot, brot),
                    random.float(0, Math.PI * 2),
                    random.float(-brot, brot),
                ] as Tuple3,
            }
        })

        return [center, ...ring]
    }, [])

    return (
        <>
            {bushes.map(({ id, ...bush }) => (
                <Bush
                    key={id}
                    {...bush}
                />
            ))}
        </>
    )
}

function Bush({
    rotation: incomingRotation = [0, 0, 0],
    maxBend = 0,
    bendStrength = 1,
    stiffness = 40,
    damping = 4,
    radius = .5,
    height = 1,
    ...props
}: BushProps) {
    const ref = useRef<Group>(null)
    const baseRotation = useMemo(() => new Quaternion().setFromEuler(_euler.set(...incomingRotation)), incomingRotation)
    const rotation = useMemo(() => new Quaternion().copy(baseRotation), [baseRotation])
    const angularVelocity = useMemo(() => new Vector3(), [])
    const { nodes } = useGLTF(model)

    useFrame((_, delta) => {
        const player = useStore.getState().player.vehicle

        if (!player || !ref.current) {
            return
        }

        const dt = ndelta(delta)
        const lookAhead = .25

        _lookAhead.copy(player.chassisBody.velocity)
            .multiplyScalar(lookAhead)
        _playerPosition.copy(player.chassisBody.position)
            .add(_lookAhead)

        _tmpVec.copy(_playerPosition)
            .sub(ref.current.position)
        const dist = _tmpVec.length()

        if (dist === 0) {
            return
        }

        _tmpVec.normalize()

        _tmpVec2.copy(_tmpVec)
            .negate()
            .setComponent(1, 1 - maxBend)

        if (_tmpVec2.lengthSq() === 0) {
            return
        }

        _tmpVec2.normalize()

        const maxDist = 1.5
        const proximity = clamp(1 - dist / maxDist, 0, 1) * bendStrength

        // velocity-based impulse: push harder when player is moving fast
        const playerSpeed = player.chassisBody.velocity.length()
        const impulse = clamp(1 - dist / maxDist, 0, 1) * playerSpeed * 10

        if (impulse > 0) {
            // push away from player velocity direction
            _tmpVec4.copy(player.chassisBody.velocity)
                .normalize()
                .cross(_up)

            angularVelocity.addScaledVector(_tmpVec4, impulse * dt)
        }

        // target direction: blend from up toward horizontal away direction
        _tmpVec3.copy(_up)
            .lerp(_tmpVec2, proximity)
            .normalize()

        // compute target quaternion, make up point like tmpvec3
        _tmpQuat.setFromUnitVectors(_up, _tmpVec3)

        _targetQuat.copy(baseRotation)
            .premultiply(_tmpQuat)

        // spring: delta quaternion from current to target
        _tmpQuat.copy(rotation)
            .invert()
            .multiply(_targetQuat)

        const angle = 2 * Math.acos(clamp(_tmpQuat.w, -1, 1))

        if (angle > 1e-4) {
            _tmpVec.set(_tmpQuat.x, _tmpQuat.y, _tmpQuat.z)
                .normalize()

            // spring acceleration
            _tmpVec.multiplyScalar(angle * stiffness)

            // integrate velocity
            angularVelocity.addScaledVector(_tmpVec, dt)
        }

        // damping
        angularVelocity.multiplyScalar(Math.exp(-damping * dt))

        // apply rotation
        const speed = angularVelocity.length()

        if (speed > 0) {
            _tmpVec4.copy(angularVelocity).normalize()
            _tmpQuat.setFromAxisAngle(_tmpVec4, speed * dt)
            rotation.multiply(_tmpQuat).normalize()
        }

        ref.current.quaternion.copy(rotation)
    })

    return (
        <mesh
            castShadow
            receiveShadow
            geometry={nodes.bush2.geometry}
            material={floorMaterial}
            ref={ref}
            dispose={null}
            scale={[radius, height, radius]}
            {...props}
        />
    )

}
