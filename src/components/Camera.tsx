import { store } from "@data/store"
import { useFrame, useThree } from "@react-three/fiber"
import { useLayoutEffect, useMemo, useRef } from "react"
import { Tuple3 } from "src/types/global"
import { config, SpringValue } from "@react-spring/core"


export default function Camera() {
    let { camera } = useThree()
    let cameraTarget = useRef<Tuple3>([0, 3, -3])
    let dir = useMemo(() => {
        return {
            x: new SpringValue(0, { config: config.stiff }),
            y: new SpringValue(0, { config: config.molasses }),
            z: new SpringValue(0, { config: config.gentle }),
        }
    }, [])

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
        let axs = ["x", "y", "z"]

        for (let [key, value] of Object.entries(dir)) {
            value.start(cameraTarget.current[axs.indexOf(key)])
            camera.position[key] = value.get()
        }
    })

    return null
}