import { clamp } from "@data/utils"
import { Quaternion, Vector3 } from "three"

const _delta = new Quaternion()
const _axis = new Vector3()
const _step = new Quaternion()

export default class QuaternionSpring {
    private stiffness: number
    private damping: number
    public current = new Quaternion()
    private velocity = new Vector3()

    constructor(stiffness: number, damping: number, base?: Quaternion) {
        this.stiffness = stiffness
        this.damping = damping

        if (base) {
            this.current.copy(base)
        }
    }

    toArray() {
        return this.current.toArray()
    }

    update(target: Quaternion, dt: number) {
        // delta = rotation that takes current -> target (in current's local frame)
        _delta.copy(this.current)
            .invert()
            .multiply(target)

        // any unit quaternion encodes a rotation of `angle` around an axis as
        // (cos(angle/2), sin(angle/2) * axis). recover the angle from w
        const angle = 2 * Math.acos(clamp(_delta.w, -1, 1))

        if (angle > 1e-4) {
            // axis of the delta rotation; (x,y,z) = sin(angle/2) * axis,
            // so normalising drops the sin(angle/2) factor.
            // skipped when angle ~ 0, both because the axis is undefined there
            // and the spring force would be negligible
            _axis.set(_delta.x, _delta.y, _delta.z).normalize()
            // hooke's law in angular form: accel = stiffness * angle, then
            // integrate into angular velocity over this frame
            this.velocity.addScaledVector(_axis, angle * this.stiffness * dt)
        }

        // exponential damping: framerate-independent equivalent of
        // velocity *= (1 - damping)^frames, prevents oscillating forever
        this.velocity.multiplyScalar(Math.exp(-this.damping * dt))

        const speed = this.velocity.length()

        if (speed > 0) {
            // integrate angular velocity into the current rotation:
            // rotate around the velocity axis by (magnitude * dt) radians.
            // normalise to fight floating-point drift away from unit length
            _axis.copy(this.velocity).normalize()
            _step.setFromAxisAngle(_axis, speed * dt)
            this.current.multiply(_step).normalize()
        }
    }
}
