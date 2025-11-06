import { store } from "@data/store"
import { useFrame } from "@react-three/fiber"
import { Euler, Quaternion, Vector3 } from "three"

let _quaternion = new Quaternion()
let _euler = new Euler()
let _position = new Vector3()
let _lookAt = new Vector3()
let offset = new Vector3(0, 3, -4.5)
let forward = new Vector3(0, 0, 20)

export default function Camera() {
    useFrame(({ camera }) => {
        let { player } = store.getState()

        if (!player.vehicle) {
            return
        }

        _quaternion.copy(player.vehicle.chassisBody.quaternion)
        _euler.setFromQuaternion(_quaternion, "YXZ")
        _euler.x = 0
        _euler.z = 0
        _position.copy(offset).applyEuler(_euler)

        camera.position.copy(player.vehicle.chassisBody.position)
        camera.position.add(_position)

        _lookAt.copy(forward).applyEuler(_euler).add(player.vehicle.chassisBody.position)
        camera.lookAt(_lookAt)
    })

    return null
}
