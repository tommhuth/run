import Counter from "@data/Counter"
import random from "@huth/random"
import { startTransition } from "react"
import { InstancedMesh, Material } from "three"

import { RockObject, RunStore, store, StreetLightObject, TreeObject } from "."

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

type RoadData = Omit<TreeObject, "id"> | Omit<RockObject, "id"> | Omit<StreetLightObject, "id">

export function addRoadObject(data: RoadData) {
    setState({
        objects: [
            {
                id: random.id(),
                ...data
            },
            ...store.getState().objects,
        ]
    })
}

export function updateRoadObject<T>(id: string, data: T) {
    setState({
        objects: [
            {
                ...store.getState().objects.find(i => i.id === id)!,
                ...data
            },
            ...store.getState().objects.filter(i => i.id !== id),
        ]
    })
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
