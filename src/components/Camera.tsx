import { store } from "@data/store/store"
import { clamp, dampFactor, map, ndelta } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import { Body } from "cannon-es"
import { useMemo } from "react"
import { Euler, Quaternion, Vector3 } from "three"
import { damp } from "three/src/math/MathUtils.js"

const _introQuaternion = new Quaternion().setFromEuler(new Euler(0, Math.PI, 0))
const _introPosition = new Vector3(.1, 2.5, -4)

const _quaternion = new Quaternion()
const _euler = new Euler()
const _position = new Vector3()
const _lean = new Vector3()
const _offset = new Vector3(0, 3, -4.5)

function targetPlayer(chassisBody: Body, delta: number) {
    const responsiveOffset = map(window.innerWidth, 400, 900, 1., 0)
    const leanAmount = 1
    const leanLambda = 1

    _lean.x = damp(
        _lean.x,
        clamp(chassisBody.angularVelocity.y / 1, -1, 1) * leanAmount,
        leanLambda,
        ndelta(delta)
    )

    _quaternion.copy(chassisBody.quaternion)
    _euler.setFromQuaternion(_quaternion, "YXZ")
    _euler.x = 0
    _euler.z = 0
    _position.copy(_offset)
        .setComponent(2, _offset.z - responsiveOffset)
        .add(_lean)
        .applyEuler(_euler)
        .add(chassisBody.position)

    _euler.setFromQuaternion(_quaternion, "YXZ")

    _euler.x *= -.2
    _euler.x += -.15
    _euler.z *= .1
    _euler.y += Math.PI

    return _quaternion.setFromEuler(_euler)
}

export default function Camera() {
    const data = useMemo(() => ({
        pk: 1,
        qk: 1
    }), [])

    useFrame(({ camera }, delta) => {
        const { player, state, loading } = store.getState()
        const nd = ndelta(delta)

        if (!player.vehicle || loading) {
            return
        }

        data.pk = damp(data.pk, state === "intro" ? .24 : 20, .5, nd)
        data.qk = damp(data.qk, state === "intro" ? .3 : 34, .5, nd)

        const targetPosition = state === "intro" ? _introPosition : _position
        const targetQuaternion = state === "intro" ? _introQuaternion : targetPlayer(player.vehicle.chassisBody, nd)

        camera.position.lerp(targetPosition, dampFactor(data.pk, nd))
        camera.quaternion.slerp(targetQuaternion, dampFactor(data.qk, nd))
    })

    return null
}
