import { store } from "@data/store"
import { useFrame } from "@react-three/fiber"
import { Euler, Quaternion, Vector3 } from "three"

export default function Camera() {
    useFrame(({ camera }) => {
        let { player } = store.getState()

        if (!player.vehicle) {
            return
        }

        /*
        
                camera.position.set(4, 2, 0)
                camera.lookAt(0, 0, 0)
        
                return*/

        let offset = new Vector3(0, 3, -4.5)
        let q = new Quaternion(...player.vehicle.chassisBody.quaternion.toArray())
        let eulr = new Euler().setFromQuaternion(q, "YXZ")

        eulr.x = eulr.z = 0

        offset.applyEuler(eulr)

        camera.position.copy(player.vehicle.chassisBody.position)
        camera.position.add(offset)

        let forw = new Vector3(0, 0, 20).applyEuler(eulr)
        let f = new Vector3(...player.vehicle.chassisBody.position.toArray()).add(forw)

        camera.lookAt(f)
    })

    return null
}
