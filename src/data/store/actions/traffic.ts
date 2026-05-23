import { ROAD_CENTER_X, ROAD_FORWARD_EDGE, ROAD_HEIGHT } from "@components/road/const"
import random from "@huth/random"
import { Tuple3 } from "@src/types/global"

import { store, TrafficElement } from "../store"
import { setState } from "./actions"

const tarfficGap = [20, 15, 35, 45, 55]

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
