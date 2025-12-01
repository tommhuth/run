import { ROAD_CENTER_X, ROAD_HEIGHT } from "@components/road/Road"
import Counter from "@data/Counter"
import random from "@huth/random"
import { Tuple3 } from "@src/types/global"
import { startTransition } from "react"
import { InstancedMesh, Material } from "three"

import { RockObject, RunStore, store, StreetLightObject, TrafficElement, TreeObject } from "."

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

const tarfficGap = [10, 12, 16, 20, 25, 40]

export function initializeTraffic() {
    return [-1, 1].map(direction => {
        let z = 10 * direction

        return Array.from({ length: 5 }).fill(null).map(() => {
            z += random.pick(...tarfficGap)

            return {
                id: random.id(),
                position: [
                    random.float(ROAD_CENTER_X * .9, ROAD_CENTER_X * 1.1) * -direction,
                    ROAD_HEIGHT + .5 + random.float(.25, .5),
                    z
                ] as Tuple3,
                guide: [
                    ROAD_CENTER_X * -direction + random.float(-.85, .85),
                    0,
                    0
                ] as Tuple3,
                direction: direction as -1 | 1,
                rotation: [
                    0,
                    direction === 1 ? 0 : Math.PI,
                    0
                ] as Tuple3,
                type: "sedan"
            } satisfies TrafficElement
        })
    }).flat()
}

export function removeTrafficElement(id: string) {
    const { traffic } = store.getState()
    const item = traffic.find(i => i.id === id)

    if (!item) {
        return
    }

    const forwardItem = traffic.filter(i => item.direction === i.direction)
        .sort((a, b) => b.position[2] - a.position[2])
        .at(0) as TrafficElement

    setState({
        traffic: [
            ...traffic.filter(i => item.id !== i.id),
            {
                ...item,
                id: random.id(),
                position: [
                    random.float(ROAD_CENTER_X * .9, ROAD_CENTER_X * 1.1) * -item.direction,
                    ROAD_HEIGHT + 1,
                    forwardItem.position[2] + random.pick(...tarfficGap)
                ]
            }
        ]
    })
}
