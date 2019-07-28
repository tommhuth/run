
import React, { useEffect } from "react"
import { useThree } from "react-three-fiber"
import { useSelector } from "react-redux"
import { Fog } from "three"
import { getBlocks, getState } from "../store/selectors/run"
import { init, clean } from "../store/actions/run"
import { useActions, useThrottledRender } from "../utils/hooks"
import Block from "./Block"
import Player from "./Player"
import GameState from "../const/GameState"

export default function RunnerEngine() {
    let blocks = useSelector(getBlocks)
    let state = useSelector(getState)
    let actions = useActions({ clean, init })
    let { scene } = useThree()

    useEffect(() => {
        scene.fog = new Fog(0xFFFFFF, 7, 40)
        actions.init()
    }, [])

    useThrottledRender(() => {
        if (state === GameState.ACTIVE) {
            actions.clean()
        }
    }, 1000, [])

    return (
        <>
            {[GameState.ACTIVE, GameState.GAME_OVER].includes(state) ? <Player /> : null} 

            {blocks.map(i => <Block key={i.id} {...i} />)}
        </>
    )
}
