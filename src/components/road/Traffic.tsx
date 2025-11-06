import { useTransitionedState } from "@data/utils"
import random from "@huth/random"
import { Tuple3 } from "@src/types/global"

import { ROAD_CENTER_X, ROAD_HEIGHT } from "./Road"
import TrafficElement from "./TrafficElement"

let gap = [10, 12, 16, 20, 25, 40]

function initTraffic() {
    let directions = [-1, 1] as const

    return directions.map(direction => {
        let z = 10 * direction

        return Array.from({ length: 4 }).fill(null).map(() => {
            z += random.pick(...gap)

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
                direction,
                rotation: [
                    0,
                    direction === 1 ? 0 : Math.PI,
                    0
                ] as Tuple3,
            }
        })
    }).flat()
}

function Traffic() {
    let [traffic, setTraffic] = useTransitionedState(initTraffic)
    let remove = (item) => {
        let forward = traffic.filter(i => item.direction === i.direction)
            .sort((a, b) => b.position[2] - a.position[2])[0]

        setTraffic([
            ...traffic.filter(j => item.id !== j.id),
            {
                ...item,
                id: random.id(),
                position: [
                    random.float(ROAD_CENTER_X * .9, ROAD_CENTER_X * 1.1) * -item.direction,
                    ROAD_HEIGHT + 1,
                    forward.position[2] + random.pick(...gap)
                ]
            }
        ])
    }

    return traffic.map(item => {
        return (
            <TrafficElement
                {...item}
                key={item.id}
                remove={() => remove(item)}
            />
        )
    })
};

export default Traffic
