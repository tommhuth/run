import { store } from "@data/store"
import { map } from "@data/utils"
import { config, SpringValue } from "@react-spring/core"
import { useFrame, useThree } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { useLayoutEffect, useMemo, useRef } from "react"

function getOffset() {
    return -(3.5 + map(window.innerWidth, 400, 800, .5, 0))
}

export default function Camera() {
    const { camera } = useThree()
    const offset = getOffset()
    const cameraTarget = useRef<Tuple3>([0, 3, offset])
    const dir = useMemo(() => {
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
        const { state, path, player: { body } } = store.getState()
        const currentSection = body && path.find(({ size, position }) => {
            return position[2] - size[2] / 2 < body.position.z
                && position[2] + size[2] / 2 > body.position.z
        })

        if (state === "gameover" || !currentSection || !body) {
            return
        }

        cameraTarget.current = [
            body.position.x,
            currentSection.position[1] + currentSection?.size[1] / 2 + 3,
            body.position.z + offset
        ]
    })

    useFrame(() => {
        const axs = ["x", "y", "z"]

        for (const [key, value] of Object.entries(dir)) {
            value.start(cameraTarget.current[axs.indexOf(key)])
            camera.position[key] = value.get()
        }
    })

    return null
}
