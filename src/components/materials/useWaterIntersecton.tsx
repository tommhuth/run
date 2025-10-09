import { useInstance } from "@components/InstancedMesh"
import { store } from "@data/store"
import random from "@huth/random"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import { Tuple3 } from "src/types/global"
import { Object3D } from "three"

import { setMatrixAt } from "./helpers"

// thanks chattyman
function intersectsWaterPlane(planeY: number, object: Object3D, size: Tuple3, threshold = 1, smooth = true) {
    const top = object.position.y + size[1] / 2
    const bottom = object.position.y - size[1] / 2

    const distTop = planeY - top
    const distBottom = planeY - bottom

    // object fully below -> both positive
    if (distTop > threshold) {
        return 0
    }

    // fully above -> both negative
    if (distBottom < -threshold) {
        return 0
    }

    // distance from fully below (0) to fully above (1)
    let t = (threshold - distTop) / (2 * threshold)

    t = Math.max(0, Math.min(1, t))

    if (smooth) {
        t = t * t * (3 - 2 * t)
    }

    return t
}

interface UseWaterIntersectorParams {
    waterLevel?: number
    size: Tuple3
    type: "circle" | "box"
    threshold?: number
    extension?: number
}

export default function useWaterIntersection({
    waterLevel = -4.5,
    threshold = 1,
    type = "circle",
    size,
    extension: incomingExtension = .25
}: UseWaterIntersectorParams) {
    const ref = useRef<Object3D>(null)
    const [index] = useInstance(type)
    const extension = useMemo(() => {
        return incomingExtension * random.float(.85, 1.1)
    }, [incomingExtension])

    useFrame(() => {
        const { instances } = store.getState()

        if (!ref.current || !instances[type] || index === null) {
            return
        }

        const intersection = intersectsWaterPlane(waterLevel, ref.current, size, threshold)
        const position: Tuple3 = [
            ref.current.position.x,
            waterLevel + .01,
            ref.current.position.z
        ]

        setMatrixAt({
            position,
            index,
            instance: instances[type].mesh,
            rotation: [
                0,
                ref.current.rotation.y + (type === "circle" ? Math.PI * .5 : 0),
                0
            ],
            scale: [
                (size[0] + extension * 2) * intersection,
                .01,
                (size[2] + extension * 2) * intersection
            ]
        })
    })

    return ref
}
