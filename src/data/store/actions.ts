import Counter from "@data/Counter"
import random from "@huth/random"
import { Tuple2, Tuple3 } from "@src/types/global"
import { startTransition } from "react"
import { InstancedMesh, Material } from "three"

import { RunStore, store } from "."

export function setState(data: Partial<RunStore>) {
    startTransition(() => {
        store.setState(data)
    })
}

export type MaterialName = "cloud"

export function setMaterial(name: MaterialName, material: Material) {
    store.setState({
        materials: {
            ...store.getState().materials,
            [name]: material,
        }
    })
}


let counter = 0

export function addPathSection() {
    const last = store.getState().path[0]
    const gap = random.boolean(.5)
    const height = 20
    const depthRange: Tuple2 = gap ? [11, 15] : [4, 8]
    const size: Tuple3 = [
        random.integer(4, 6),
        height,
        random.integer(...depthRange)
    ]
    const position: Tuple3 = [
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

interface DeviceMotionEventiOS extends DeviceMotionEvent {
    requestPermission?: () => Promise<"granted" | "denied">;
}

export const hasRequestMotionPermission = !!(DeviceMotionEvent as unknown as DeviceMotionEventiOS).requestPermission

export async function requestMotionPermission() {
    const event = DeviceMotionEvent as unknown as DeviceMotionEventiOS

    if (event.requestPermission) {
        const permission = await event.requestPermission()

        setState({
            hasMotionAccess: permission === "granted",
            motionAccessDenied: permission === "denied"
        })

        return permission
    }
}

export type InstanceName = "box" | "circle"

export interface Instance {
    mesh: InstancedMesh;
    maxCount: number;
    index: Counter;
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
