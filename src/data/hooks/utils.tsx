import random from "@huth/random"
import { RenderCallback, useFrame } from "@react-three/fiber"
import { Dispatch, SetStateAction, startTransition, useCallback, useRef, useState } from "react"

export function useLowerPriorityFrame(cb: RenderCallback, frameInterval: number) {
    const frame = useRef(random.integer(0, frameInterval * 10))

    useFrame((...params) => {
        if (frame.current % frameInterval === 0) {
            cb(...params)
        }
        frame.current++
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
