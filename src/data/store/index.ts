import random from "@huth/random"
import { Body } from "cannon-es"
import { startTransition } from "react"
import { Tuple3 } from "src/types/global"
import { DepthTexture, Material, Mesh } from "three"
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

export type MaterialName = "cloud"

interface PathSection {
    id: string
    size: Tuple3
    position: Tuple3
    fixed?: boolean
}
interface Store {
    state: "intro" | "gameover" | "running"
    hasMotionAccess: boolean
    path: PathSection[]
    depthTexture: null | DepthTexture
    materials: Record<MaterialName, Material>
    player: {
        mesh: Mesh | null
        body: Body | null
    }
}

interface DeviceMotionEventiOS extends DeviceMotionEvent {
    requestPermission?: () => Promise<"granted" | "denied">;
}

export const hasRequestMotionPermission = !!(DeviceMotionEvent as unknown as DeviceMotionEventiOS).requestPermission

export async function requestMotionPermission() {
    let event = DeviceMotionEvent as unknown as DeviceMotionEventiOS

    if (event.requestPermission) {
        let permission = await event.requestPermission()

        setState({ hasMotionAccess: permission === "granted" })

        return permission
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
        hasMotionAccess: hasRequestMotionPermission ? false : true,
        depthTexture: null,

        materials: {} as Store["materials"],
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


export function setMaterial(name: MaterialName, material: Material) {
    store.setState({
        materials: {
            ...store.getState().materials,
            [name]: material,
        }
    })
}

export { store, useStore }