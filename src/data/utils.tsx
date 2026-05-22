import { Quaternion as CannonQuaternion } from "cannon-es"
import { Euler, Quaternion } from "three"
import { clamp as threeClamp, mapLinear } from "three/src/math/MathUtils.js"

export function map(x: number, a1: number, a2: number, b1: number, b2: number) {
    return mapLinear(clamp(x, a1, a2), a1, a2, b1, b2)
}

export function clamp(value: number, min = 0, max = 1) {
    return threeClamp(value, min, max)
}

export function ndelta(delta: number) {
    const nDelta = clamp(delta, 0, 1 / 30)

    return nDelta
}

export function dampFactor(k: number, delta: number) {
    return 1 - Math.exp(-k * ndelta(delta))
}

const _euler = new Euler()
const _quaternion = new Quaternion()

export function extractRotation(quat: CannonQuaternion) {
    return _euler.setFromQuaternion(_quaternion.copy(quat))
}
