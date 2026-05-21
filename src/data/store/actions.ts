import { ROAD_CENTER_X, ROAD_FORWARD_EDGE, ROAD_HEIGHT } from "@components/road/const"
import Counter from "@data/Counter"
import random from "@huth/random"
import { Tuple3 } from "@src/types/global"
import { startTransition } from "react"
import { InstancedMesh, Material } from "three"
import { Object3D } from "three/webgpu"

import { Message, RoadPart, RunStore, store, TrafficElement } from "."

export function setState(data: Partial<RunStore>) {
    startTransition(() => {
        store.setState(data)
    })
}

export type MaterialName = "beam" | "dot"

export function setMaterial(name: MaterialName, material: Material) {
    store.setState({
        materials: {
            ...store.getState().materials,
            [name]: material,
        }
    })
}

export function setDebugData(name: keyof RunStore["debug"], value: boolean) {
    store.setState({
        debug: {
            ...store.getState().debug,
            [name]: value,
        }
    })
}

export function getRandomRoadExtension() {
    return random.pick(
        generateForestPart,
        generateForestPart,
        generateForestPart,
        generateForestPart,
        generateForestPart,
        generateRocksPart,
        generateBridgePart,
        generateForestPart,
        generateForestPart,
    )
}

interface PreviousPart {
    position: Tuple3
    depth: number
}

export function generateForestPart(previous: PreviousPart): RoadPart {
    return {
        type: "forest",
        id: random.id(),
        depth: 20,
        position: [
            0,
            0,
            previous.position[2] + previous.depth
        ]
    }
}

export function generateRocksPart(previous: PreviousPart): RoadPart {
    return {
        type: "rocks",
        id: random.id(),
        depth: 20,
        position: [
            0,
            0,
            previous.position[2] + previous.depth
        ]
    }
}

export function generateBridgePart(previous: PreviousPart): RoadPart {
    return {
        type: "bridge",
        id: random.id(),
        depth: 20,
        position: [
            0,
            0,
            previous.position[2] + previous.depth
        ]
    }
}

export function generatePickupPoint(previous: PreviousPart): RoadPart {
    return {
        type: "pickupPoint",
        id: random.id(),
        depth: 20,
        position: [
            0,
            0,
            previous.position[2] + previous.depth
        ]
    }
}

export function extendRoad(previous: PreviousPart) {
    const { road, player } = store.getState()
    let generator = getRandomRoadExtension()
    let pickupCounter = player.pickupCounter

    if (pickupCounter === player.pickupInterval) {
        generator = generatePickupPoint
        pickupCounter = 0
    } else {
        pickupCounter++
    }

    setState({
        player: {
            ...player,
            pickupCounter,
            pickupInterval: pickupCounter === 0 ? random.integer(2, 6) : player.pickupInterval
        },
        road: [
            ...road,
            generator(previous)
        ]
    })
}


export type InstanceName = "box" | "circle" | "rock" | "streetLight" | "tree1" | "tree2" | "tree3" | "tree4" | "tree5" | "tree6"

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

const tarfficGap = [25, 15, 35, 45, 55]

export function initializeTraffic(countPerDirection = 4) {
    const directions = [-1, 1] as const

    return directions.map(direction => {
        let z = 10 * direction

        return Array.from({ length: countPerDirection }).fill(null).map((i, index) => {
            z += tarfficGap[index % (tarfficGap.length - 1)]

            return {
                id: random.id(),
                position: [
                    random.float(ROAD_CENTER_X * .9, ROAD_CENTER_X * 1.1) * -direction,
                    ROAD_HEIGHT + 1,
                    z
                ] as Tuple3,
                velocity: 6,
                guide: [
                    ROAD_CENTER_X * -direction + random.float(-.85, .85),
                    0,
                    0
                ] as Tuple3,
                direction,
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
    const { traffic, player } = store.getState()
    const item = traffic.find(i => i.id === id)

    if (!item || !player.vehicle) {
        return
    }

    const forwardItem = traffic.filter(i => item.direction === i.direction)
        .sort((a, b) => b.position[2] - a.position[2])
        .at(0) as TrafficElement
    // dont spawn traffic in visibly
    const forwardZ = Math.max(
        forwardItem.position[2] + random.pick(...tarfficGap),
        player.vehicle.chassisBody.position.z + ROAD_FORWARD_EDGE
    )

    setState({
        traffic: [
            ...traffic.filter(i => item.id !== i.id),
            {
                ...item,
                id: random.id(),
                position: [
                    random.float(ROAD_CENTER_X * .9, ROAD_CENTER_X * 1.1) * -item.direction,
                    ROAD_HEIGHT + 1,
                    forwardZ
                ]
            }
        ]
    })
}

export function createMessage(data: Partial<Omit<Message, "text">> & { text: string }, duration = 4000) {
    const id = random.id()

    setTimeout(() => {
        setState({
            messages: store.getState().messages.filter(i => i.id !== id)
        })
    }, duration)

    setState({
        messages: [
            ...store.getState().messages,
            {
                ...data,
                id
            }
        ]
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
