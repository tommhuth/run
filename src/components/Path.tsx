import { addPathSection, useStore } from "@data/store"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import PathSection from "./PathSection"
import { ndelta } from "@data/utils"

export default function Path() {
    let path = useStore(i => i.path)
    let timer = useRef(0)

    useFrame(({ camera }, delta) => {
        let forwardSection = path[0]
        let forwardBuffer = 25
        let checkInterval = 350

        if (
            forwardSection
            && camera.position.z > forwardSection?.position[2] - forwardBuffer
            && timer.current > checkInterval
        ) {
            addPathSection()
        } else {
            timer.current += ndelta(delta) * 1000
        }
    })

    return path.map(i => {
        return (
            <PathSection {...i} key={i.id} />
        )
    })
} 