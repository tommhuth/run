import IndexHandler from "@data/IndexHandler"
import random from "@huth/random"
import { Tuple3 } from "@src/types/global"

import { Leaf, store } from "../store"
import { setState } from "./actions"

export const LEAF_MAX_COUNT = 150

const leafIndex = new IndexHandler(LEAF_MAX_COUNT)

interface SpawnLeavesConfig {
    position: Tuple3
    size: Tuple3
    velocity: Tuple3
    count: number
    spread: Tuple3
}

export function spawnLeaves({
    position,
    size,
    velocity = [0, 0, 0],
    count = 8,
    spread = [.5, .5, .5],
}: SpawnLeavesConfig) {
    const leaves: Leaf[] = Array.from({ length: count }).map(() => ({
        id: random.id(),
        index: leafIndex.next(),
        position: [
            position[0] + random.float(-size[0] / 2, size[0] / 2) + random.float(-spread[0] / 2, spread[0] / 2),
            position[1] + random.float(-size[1] / 2, size[1] / 2) + random.float(-spread[1] / 2, spread[1] / 2),
            position[2] + random.float(-size[2] / 2, size[2] / 2) + random.float(-spread[2] / 2, spread[2] / 2),
        ],
        velocity: [
            random.float(velocity[0] * .5, velocity[0]),
            random.float(velocity[1] * .5, velocity[1]),
            random.float(velocity[2] * .5, velocity[2]),
        ],
        scale: random.float(.85, 2),
        time: random.float(0, Math.PI * 2),
    }))

    setState({
        leaves: [
            ...store.getState().leaves,
            ...leaves
        ],
    })
}

export function removeLeaves(ids: string[]) {
    const set = new Set(ids)

    setState({
        leaves: store.getState().leaves.filter(i => !set.has(i.id)),
    })
}
