import { store } from "@data/store"
import { useFrame, useThree } from "@react-three/fiber"
import { useLayoutEffect, useRef } from "react"
import { Tuple3 } from "src/types/global"

export default function Camera() {
    let { camera } = useThree()
    let cameraTarget = useRef<Tuple3>([0, 3, -3])

    useLayoutEffect(() => {
        camera.position.set(0, 3, -3)
        camera.lookAt(0, 0, 6)
    }, [camera])


    useFrame(() => {
        let { state, path, player: { body } } = store.getState()
        let currentSection = body && path.find(({ size, position }) => {
            return position[2] - size[2] / 2 < body.position.z
                && position[2] + size[2] / 2 > body.position.z
        })

        if (state !== "running" || !currentSection || !body) {
            return
        }

        cameraTarget.current = [
            body.position.x,
            currentSection.position[1] + currentSection?.size[1] / 2 + 3,
            body.position.z - 3
        ]
    })


    useFrame(() => {
        camera.position.x += (cameraTarget.current[0] - camera.position.x) * .1
        camera.position.y += (cameraTarget.current[1] - camera.position.y) * .025
        camera.position.z += (cameraTarget.current[2] - camera.position.z) * .05
    })

    return null
}