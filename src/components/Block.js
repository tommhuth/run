import React, { useEffect, useState } from "react"
import { api } from "../data/store"
import BlockType from "../data/const/BlockType"
import ObstaclesBlock from "./blocks/ObstaclesBlock"
import PlainBlock from "./blocks/PlainBlock"
import EnemiesBlock from "./blocks/EnemiesBlock"

export default function Block({
    type,
    active: defaultActive = false,
    ...props
}) {
    let [active, setActive] = useState(defaultActive)

    useEffect(() => {
        return api.subscribe(({ z }) => {
            if (z > props.start - 20 && z < props.end + 20) {
                if (!active) {
                    setActive(true)
                }
            } else {
                if (active) {
                    setActive(false)
                }
            }
        }, state => state.data.position)
    }, [active])

    switch (type) {
        case BlockType.OBSTACLES:
            return <ObstaclesBlock {...props} active={active} />
        case BlockType.PLAIN:
            return <PlainBlock {...props} active={active} />
        case BlockType.ENEMIES:
            return <EnemiesBlock {...props} active={active} />
        default:
            throw new Error(`Unknown Block type ${type}`)
    }
}