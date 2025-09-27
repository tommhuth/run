import { store } from "@data/store"
import { useFrame, useThree } from "@react-three/fiber"
import { useLayoutEffect, useRef } from "react"
import { Tuple3 } from "src/types/global"
import { damp } from "three/src/math/MathUtils.js"

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

    useFrame((state, delta) => {
        let lambdas = [4, 2, 1.5]

        for (let i = 0; i < 3; i++) {
            let value = damp(camera.position.getComponent(i), cameraTarget.current[i], lambdas[i], delta)

            camera.position.setComponent(i, value)
        }
    })

    return null
}