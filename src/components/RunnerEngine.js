
import React, { useEffect } from "react"
import { useSelector } from "react-redux"
import { getBlocks, getState } from "../store/selectors/run"
import { generateInitalPath, generatePath } from "../store/actions/run"
import { useActions, useThrottledRender } from "../utils/hooks"
import Block from "./blocks/Block"
import Player from "./Player"
import GameState from "../const/GameState" 
import { useWorld, getPlayer } from "../utils/cannon"
import Only from "./Only"

export default function RunnerEngine() {
    let blocks = useSelector(getBlocks)
    let state = useSelector(getState)
    let world = useWorld()
    let actions = useActions({ generatePath, generateInitalPath })
  
    useEffect(() => { 
        actions.generateInitalPath()
    }, [actions])

    useThrottledRender(() => { 
        if (state === GameState.ACTIVE && world) {
            let player = getPlayer(world)
            
            if (player) {
                actions.generatePath(player.position)
            }
        }
    }, 400, [state, world])

    return (
        <>
            <Only if={[GameState.ACTIVE, GameState.GAME_OVER].includes(state)}>
                <Player /> 
            </Only> 
 
            {blocks.map(i => <Block key={i.id} {...i} />)} 
        </>
    )
}
