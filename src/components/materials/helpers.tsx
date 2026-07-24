import { Tuple2, Tuple3 } from "src/types/global"
import {
    BufferAttribute,
    BufferGeometry,
    Color,
    ColorRepresentation,
    Euler,
    InstancedMesh,
    Matrix4,
    Quaternion,
    QuaternionLike,
    Vector3,
    Vector3Like
} from "three"

export function glsl(strings: TemplateStringsArray, ...variables) {
    const str: string[] = []

    strings.forEach((x, i) => {
        str.push(x)
        str.push(variables[i] || "")
    })

    return str.join("")
}

const _matrix = new Matrix4()
const _quaternion = new Quaternion()
const _position = new Vector3(0, 0, 0)
const _scale = new Vector3(1, 1, 1)
const _euler = new Euler()

interface SetMatrixAtParams {
    instance: InstancedMesh
    index: number
    position?: Tuple3 | Vector3Like
    rotation?: Tuple3 | QuaternionLike
    scale?: Tuple3 | number
}

export function setMatrixAt({
    instance,
    index,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
}: SetMatrixAtParams) {
    instance.setMatrixAt(index, _matrix.compose(
        Array.isArray(position) ? _position.set(...position) : _position.copy(position),
        Array.isArray(rotation) ? _quaternion.setFromEuler(_euler.set(...rotation, "XYZ")) : _quaternion.copy(rotation),
        Array.isArray(scale) ? _scale.set(...scale) : _scale.set(scale, scale, scale),
    ))
    instance.instanceMatrix.needsUpdate = true
}

export function setMatrixNullAt(instance: InstancedMesh, index: number) {
    setMatrixAt({
        instance,
        index,
        position: [0, 0, 100_000],
        scale: [0, 0, 0],
        rotation: [0, 0, 0]
    })
}

const _color = new Color()

export function setColorAt(instance: InstancedMesh, index: number, color: ColorRepresentation) {
    instance.setColorAt(index, _color.set(color))

    if (instance.instanceColor) {
        instance.instanceColor.needsUpdate = true
    } else {
        console.warn("Instance is not initialized with instanceColor: setColorAt will do nothing.")
    }
}

export function setBufferAttribute(
    geometry: BufferGeometry,
    name: string,
    value: number | Tuple2 | Tuple3,
    index: number
) {
    const attribute = geometry.getAttribute(name) as BufferAttribute

    attribute.set(Array.isArray(value) ? value : [value], index)
    attribute.needsUpdate = true
}
