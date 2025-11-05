import { Dispatch, SetStateAction, startTransition, useCallback, useState } from "react"
import { clamp as threeClamp, mapLinear } from "three/src/math/MathUtils.js"

export function map(x: number, a1: number, a2: number, b1: number, b2: number) {
    return mapLinear(clamp(x, a1, a2), a1, a2, b1, b2)
}

export function clamp(value: number, min = 1, max = 1) {
    return threeClamp(value, min, max)
}

export function ndelta(delta: number) {
    const nDelta = clamp(delta, 0, 1 / 30)

    return nDelta
}

export function useTransitionedState<T>(
    init: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] {
    let [state, setState] = useState<T>(init)
    let update = useCallback<Dispatch<SetStateAction<T>>>((data: SetStateAction<T>) => {
        startTransition(() => setState(data))
    }, [])

    return [state, update]
}
