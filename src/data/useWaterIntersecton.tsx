import { useInstance } from "@components/InstancedMesh"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import { Tuple3 } from "src/types/global"
import { Object3D } from "three"
import { store } from "./store"
import { setMatrixAt } from "./utils"

interface UseWaterIntersectorProps {
    waterLevel?: number
    size: Tuple3
    type: "circle" | "box"
    threshold?: number
    detail?: number
    extension?: number
}

function easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3)
}
function easeInCubic(x: number): number {
    return x * x * x
}

// thanks chattyman
function intersectsWaterPlane(y: number, obj: Object3D, size: Tuple3, bufferDown = 0, bufferUp = 0) {
    const bottom = obj.position.y - size[1] / 2 - bufferDown
    const top = obj.position.y + size[1] / 2 + bufferUp
    const mid = (top + bottom) / 2

    if (y <= bottom || y >= top) return 0

    if (y < mid) {
        // ramp up from bottom - mid
        return easeInCubic((y - bottom) / (mid - bottom))
    } else {
        // ramp down from mid - top
        return easeOutCubic((top - y) / (top - mid))
    }
}

export default function useWaterIntersection({
    waterLevel = -4.5,
    threshold = 3,
    type = "circle",
    size,
    extension = .0

}: UseWaterIntersectorProps) {
    let ref = useRef<Object3D>(null)
    let [index] = useInstance(type)

    useFrame(() => {
        let { instances } = store.getState()

        if (!ref.current || !instances[type] || index === null) {
            return
        }

        let intersection = intersectsWaterPlane(waterLevel, ref.current, size, threshold)
        let position: Tuple3 = [
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