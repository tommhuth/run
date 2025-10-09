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
