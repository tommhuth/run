import { store } from "@data/store"
import { clamp, dampFactor, map } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import { Euler, Quaternion, Vector3 } from "three"
import { damp } from "three/src/math/MathUtils.js"

const _quaternion = new Quaternion()
const _euler = new Euler()
const _position = new Vector3()
const _lean = new Vector3()
const offset = new Vector3(0, 3, -4.5)

export default function Camera() {
    useFrame(({ camera }, delta) => {
        const { player } = store.getState()
        const responsiveOffset = map(window.innerWidth, 400, 900, 1., 0)
        /*
        camera.position.set(0, 50, -5)
        camera.lookAt(0, 0, 30)

        return
        */

        if (!player.vehicle) {
            return
        }

        const leanAmount = 1
        const leanLambda = 1

        _lean.x = damp(
            _lean.x,
            clamp(player.vehicle.chassisBody.angularVelocity.y / 1, -1, 1) * leanAmount,
            leanLambda,
            delta
        )

        _quaternion.copy(player.vehicle.chassisBody.quaternion)
        _euler.setFromQuaternion(_quaternion, "YXZ")
        _euler.x = 0
        _euler.z = 0
        _position.copy(offset)
            .setComponent(2, offset.z - responsiveOffset)
            .add(_lean)
            .applyEuler(_euler)
            .add(player.vehicle.chassisBody.position)

        _euler.setFromQuaternion(_quaternion, "YXZ")

        _euler.x *= -.2
        _euler.x += -.15
        _euler.z *= .1
        _euler.y += Math.PI

        camera.position.lerp(_position, dampFactor(20, delta))
        camera.quaternion.slerp(_quaternion.setFromEuler(_euler), dampFactor(34, delta))
    })

    return null
}
