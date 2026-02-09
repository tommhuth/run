import { store } from "@data/store"
import { useFrame } from "@react-three/fiber"
import { Euler, Quaternion, Vector3 } from "three"

const _quaternion = new Quaternion()
const _euler = new Euler()
const _position = new Vector3()
const _lookAt = new Vector3()
const offset = new Vector3(0, 3, -4.5)
const forward = new Vector3(0, 0, 20)

export default function Camera() {
    useFrame(({ camera }) => {
        const { player } = store.getState()
        /*
        camera.position.set(0, 50, -5)
        camera.lookAt(0, 0, 30)

        return*/

        if (!player.vehicle) {
            return
        }

        _quaternion.copy(player.vehicle.chassisBody.quaternion)
        _euler.setFromQuaternion(_quaternion, "YXZ")
        _euler.x = 0
        _euler.z = 0
        _position.copy(offset)
            .applyEuler(_euler)
            .add(player.vehicle.chassisBody.position)

        _euler.setFromQuaternion(_quaternion, "YXZ")

        _euler.x *= -.2
        _euler.x += -.15
        _euler.z *= -.2
        _euler.y += Math.PI

        camera.position.lerp(_position, .4)
        camera.quaternion.slerp(_quaternion.setFromEuler(_euler), .4)

        _lookAt.copy(forward)
            .applyEuler(_euler)
            .add(player.vehicle.chassisBody.position)
        //camera.lookAt(_lookAt)
    })

    return null
}
