
import React, { useEffect } from "react"
import { useSelector } from "react-redux"
import { getBlocks, getState } from "../store/selectors/run"
import { generateInitalPath, generatePath } from "../store/actions/run"
import { useActions, useThrottledRender } from "../utils/hooks"
import Block from "./blocks/Block"
import Player from "./Player"
import GameState from "../const/GameState" 
import { useWorld } from "../utils/cannon"

export default function RunnerEngine() {
    let blocks = useSelector(getBlocks)
    let state = useSelector(getState)
    let world = useWorld()
    let actions = useActions({ generatePath, generateInitalPath })
  
    useEffect(() => {
        actions.generateInitalPath()
    }, [])

    useThrottledRender(() => { 
        if (state === GameState.ACTIVE && world) {
            let player = world.bodies.find(i => i.xname === "player")
            
            actions.generatePath(player.position)
        }
    }, 400, [state, world])

    return (
        <>
            {[GameState.ACTIVE, GameState.GAME_OVER].includes(state) ? <Player /> : null}
 
            {blocks.map(i => <Block key={i.id} {...i} />)} 
        </>
    )
}
