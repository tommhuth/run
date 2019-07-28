
import React from "react"
import { useSelector } from "react-redux"
import { getState } from "../store/selectors/run"
import { start } from "../store/actions/run"
import GameState from "../const/GameState"
import Only from "./Only"
import { useActions } from "../utils/hooks"

export default function Ui() {
    let state = useSelector(getState)
    let actions = useActions({ start })

    return (
        <>
            <Only if={state === GameState.READY}>
                <div className="panel">
                    <button onClick={actions.start}>Start</button>
                </div>
            </Only>
            <Only if={state === GameState.GAME_OVER}>
                <div className="panel">
                    <button onClick={actions.start}>Restart</button>
                </div>
            </Only>
        </>
    )
}