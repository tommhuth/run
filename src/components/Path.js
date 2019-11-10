import React, { useEffect, useRef } from "react"
import { useStore } from "../data/store"
import BlockType from "../data/const/BlockType" 
import StepsBlock from "./blocks/StepsBlock"
import GameState from "../data/const/GameState"
import PlainBlock from "./blocks/PlainBlock"
import PillarsBlock from "./blocks/PillarsBlock"

export default function Path() {
    let blocks = useStore(state => state.data.blocks)
    let state = useStore(state => state.data.state)
    let actions = useStore(state => state.actions)
    let tid = useRef()

    useEffect(() => {
        if ([GameState.READY, GameState.REQUEST_ORIENTATION_ACCESS].includes(state)) {
            actions.generatePath()
        }

        if (state === GameState.RUNNING) {
            tid.current = setInterval(() => actions.generatePath(), 1000)
            
            return () => clearInterval(tid.current)
        }  
    }, [state])

    return (
        <>
            {blocks.map(i => {
                switch (i.type) { 
                    case BlockType.PILLARS:
                        return <PillarsBlock {...i} key={i.id} />
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