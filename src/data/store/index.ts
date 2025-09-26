import random from "@huth/random"
import { Body } from "cannon-es"
import { startTransition } from "react"
import { Tuple3 } from "src/types/global"
import { Mesh } from "three"
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"


interface PathSection {
    id: string
    size: Tuple3
    position: Tuple3
    fixed?: boolean
}
interface Store {
    state: "intro" | "gameover" | "running"
    path: PathSection[]
    player: {
        mesh: Mesh | null
        body: Body | null
    }
}

export function addPathSection(size: Tuple3, position: Tuple3) {
    setState({
        path: [
            {
                id: random.id(),
                size,
                position
            },
            ...store.getState().path,
        ]
    })
}

export function removePathSection(id: string) {
    setState({
        path: store.getState().path.filter(i => i.id !== id)
    })
}

export function setState(data: Partial<Store>) {
    startTransition(() => {
        store.setState(data)
    })
}

const store = create(
    subscribeWithSelector<Store>(() => ({
        state: "intro",
        player: {
            mesh: null,
            body: null
        },
        path: [
            {
                id: random.id(),
                size: [7, 20, 7],
                position: [0, -10, 0],
                fixed: true
            }
        ]
    }))
)
const useStore = store

export { store, useStore }