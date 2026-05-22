import random from "@huth/random"
import { Tuple3 } from "@src/types/global"

import { RoadPart, store } from "../store"
import { setState } from "./actions"

interface PreviousPart {
    position: Tuple3
    depth: number
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
