import random from "@huth/random"
import { RenderCallback, useFrame } from "@react-three/fiber"
import { Dispatch, SetStateAction, startTransition, useCallback, useRef, useState } from "react"

export function useLowerPriorityFrame(cb: RenderCallback, intervalMs: number) {
    const elapsed = useRef(random.float(0, intervalMs))

    useFrame((...params) => {
        const [, delta] = params

        elapsed.current += delta * 1000

        if (elapsed.current >= intervalMs) {
            elapsed.current = 0
            cb(...params)
        }
    })
}

export function useTransitionedState<T>(
    init: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] {
    const [state, setState] = useState<T>(init)
    const update = useCallback<Dispatch<SetStateAction<T>>>((data: SetStateAction<T>) => {
        startTransition(() => setState(data))
    }, [])

    return [state, update]
}
