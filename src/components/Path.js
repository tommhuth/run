import React, { useEffect, useRef } from "react"
import { useStore } from "../data/store"
import BlockType from "../data/const/BlockType"
import BaseTowerBlock from "./blocks/BaseTowerBlock"
import StepsBlock from "./blocks/StepsBlock"
import GameState from "../data/const/GameState"
import PlainBlock from "./blocks/PlainBlock"

export default function Path() {
    let blocks = useStore(state => state.data.blocks)
    let state = useStore(state => state.data.state)
    let actions = useStore(state => state.actions)
    let tid = useRef()

    useEffect(() => {
        actions.generatePath()

        if (state === GameState.RUNNING) {
            tid.current = setInterval(() => actions.generatePath(), 750)
        } else {
            clearInterval(tid.current)
        }
    }, [state])

    return (
        <>
            {blocks.map(i => {
                switch (i.type) {
                    case BlockType.BASE_TOWER:
                        return <BaseTowerBlock {...i} key={i.id} />
                    case BlockType.STEPS:
                        return <StepsBlock {...i} key={i.id} />
                    case BlockType.PLAIN:
                        return <PlainBlock {...i} key={i.id} />
                    case BlockType.GAP:
                        return null
                    default:
                        throw new Error("Unknown block type " + i.type)
                }
            })}
        </>
    )
}