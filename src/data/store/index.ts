import Counter from "@data/Counter"
import random from "@huth/random"
import { Body } from "cannon-es"
import { startTransition } from "react"
import { Tuple2, Tuple3 } from "src/types/global"
import { DepthTexture, InstancedMesh, Material, Mesh } from "three"
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

export type InstanceName = "box" | "circle"

export type MaterialName = "cloud"
export interface Instance {
    mesh: InstancedMesh;
    maxCount: number;
    index: Counter;
}
interface PathSection {
    id: string
    size: Tuple3
    position: Tuple3
    fixed?: boolean
    gap: boolean
}
interface Store {
    state: "intro" | "gameover" | "running"
    hasMotionAccess: boolean
    motionAccessDenied: boolean
    path: PathSection[]
    instances: Record<InstanceName, Instance>
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

        setState({
            hasMotionAccess: permission === "granted",
            motionAccessDenied: permission === "denied"
        })

        return permission
    }
}

export function setInstance(name: string, mesh: InstancedMesh, maxCount: number) {
    store.setState({
        instances: {
            ...store.getState().instances,
            [name]: {
                mesh,
                maxCount,
                index: new Counter(maxCount)
            }
        }
    })
}

let counter = 0

export function addPathSection() {
    let last = store.getState().path[0]
    let gap = random.boolean(.5)
    let height = 20
    let depthRange: Tuple2 = gap ? [11, 15] : [4, 8]
    let size: Tuple3 = [
        random.integer(4, 6),
        height,
        random.integer(...depthRange)
    ]
    let position: Tuple3 = [
        random.integer(-1, 1) + Math.sin(counter * .45) * 2,
        -height / 2 + Math.sin(counter * .4) * 3,
        last.position[2] + last.size[2] / 2 + size[2] / 2
    ]

    counter++
    setState({
        path: [
            {
                id: random.id(),
                size,
                gap,
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
        motionAccessDenied: false,
        materials: {} as Store["materials"],

        instances: {} as Store["instances"],
        player: {
            mesh: null,
            body: null
        },
        path: [
            {
                id: random.id(),
                size: [7, 20, 7],
                position: [0, -10.1, 0],
                fixed: true,
                gap: false
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