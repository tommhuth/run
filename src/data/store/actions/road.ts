import { ROAD_FORWARD_EDGE } from "@components/road/const"
import random from "@huth/random"
import { Tuple3 } from "@src/types/global"

import { RoadPart, store } from "../store"
import { setState } from "./actions"

interface PreviousPart {
    position: Tuple3
    depth: number
}

export function getRandomRoadExtension() {
    return random.boolean(.85) ? generateForestPart : random.pick(generateRocksPart, generateBridgePart)
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

export function reachDestination() {
    const player = store.getState().player
    const nextTargetAt = player.nextTargetAt + random.integer(ROAD_FORWARD_EDGE * 1.5, ROAD_FORWARD_EDGE * 4)
    const targetDistance = nextTargetAt - player.nextTargetAt
    const secondsPerMeter = .08
    const deadlineInSeconds = targetDistance * secondsPerMeter
    let score = 0

    if (player.deadline > 0) {
        const currentTime = (player.deadline - Date.now()) / 1000

        score = currentTime * player.targetDistance * 100
        score = Math.round(score)
    }

    setState({
        player: {
            ...player,
            score,
            nextTargetAt,
            targetDistance,
            deadline: Date.now() + deadlineInSeconds * 1000,
            time: deadlineInSeconds
        }
    })
}


export function extendRoad(previous: PreviousPart) {
    const { road } = store.getState()
    const generator = getRandomRoadExtension()

    setState({
        road: [
            ...road,
            generator(previous)
        ]
    })
}
