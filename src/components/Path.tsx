import { addPathSection, useStore } from "@data/store"
import { ndelta } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"

import PathSection from "./PathSection"

export default function Path() {
    const path = useStore(i => i.path)
    const timer = useRef(0)

    useFrame(({ camera }, delta) => {
        const forwardSection = path[0]
        const forwardBuffer = 25
        const checkInterval = 350

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
