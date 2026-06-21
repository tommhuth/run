import IndexHandler from "@data/IndexHandler"
import { startTransition } from "react"
import { InstancedMesh, Material } from "three"
import { Object3D } from "three/webgpu"

import { RunStore, store } from "../store"

export function setState(data: Partial<RunStore>) {
    startTransition(() => {
        store.setState(data)
    })
}

export type MaterialName = "road"

export function setMaterial(name: MaterialName, material: Material) {
    store.setState({
        materials: {
            ...store.getState().materials,
            [name]: material,
        }
    })
}

export function setDebugData<T extends keyof RunStore["debug"]>(name: T, value: RunStore["debug"][T]) {
    store.setState({
        debug: {
            ...store.getState().debug,
            [name]: value,
        }
    })
}

type TreeIndex = 1 | 2 | 3 | 4 | 5 | 6
type StreetLightType = "Dynamic" | "Static"

export type InstanceName = "rock" | `streetlight${StreetLightType}` | `tree${TreeIndex}`

export interface Instance {
    mesh: InstancedMesh;
    maxCount: number;
    index: IndexHandler;
}

export function setInstance(name: string, mesh: InstancedMesh, maxCount: number) {
    store.setState({
        instances: {
            ...store.getState().instances,
            [name]: {
                mesh,
                maxCount,
                index: new IndexHandler(maxCount)
            }
        }
    })
}

export function setSharedObject(object: Object3D) {
    setState({
        shared: {
            ...store.getState().shared,
            [object.name]: object
        }
    })
}
