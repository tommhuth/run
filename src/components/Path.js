import React, { useEffect, useRef } from "react"
import { useStore } from "../data/store" 
import BlockType from "../data/const/BlockType" 
import EmptyBlock from "./blocks/EmptyBlock" 
import GameState from "../data/const/GameState"

export default function Path() {
    let blocks = useStore(state => state.data.blocks)
    let state = useStore(state => state.data.state)
    let actions = useStore(state => state.actions)
    let tid = useRef()

    useEffect(() => {
        if (state === GameState.RUNNING) { 
            tid.current = setInterval(() => actions.maintainPath(), 300)
        } else {
            clearInterval(tid.current)
        }
    }, [state]) 

    return (
        <>
            {blocks.map(i => { 
                switch (i.type) {
                    case BlockType.EMPTY:
                        return <EmptyBlock {...i} key={i.id} />
                    default:
                        return null
                }
            })}
        </>
    )
}