import { Quaternion as CannonQuaternion } from "cannon-es"
import { Euler, Quaternion } from "three"
import { clamp as threeClamp, mapLinear } from "three/src/math/MathUtils.js"

export function map(x: number, a1: number, a2: number, b1: number, b2: number) {
    return mapLinear(clamp(x, a1, a2), a1, a2, b1, b2)
}

export function clamp(value: number, min = 0, max = 1) {
    return threeClamp(value, min, max)
}

// loose cap: only catches tab-return / multi-second spikes. damping is
// numerically stable at any dt, so we don't need a tight ceiling here
export function ndelta(delta: number) {
    return clamp(delta, 0, 1 / 20)
}

// expects an already-clamped dt  
export function dampFactor(k: number, dt: number) {
    return 1 - Math.exp(-k * dt)
}

const _euler = new Euler()
const _quaternion = new Quaternion()

export function extractRotation(quat: CannonQuaternion, _target = _euler) {
    return _target.setFromQuaternion(_quaternion.copy(quat))
}
