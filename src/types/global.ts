import { BufferGeometry } from "three"

export type Tuple4 = [number, number, number, number]
export type Tuple3 = [number, number, number]
export type Tuple2 = [number, number]

export interface GLTFModel<T extends string[]> {
    nodes: Record<T[number], { geometry: BufferGeometry }>
} 