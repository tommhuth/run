import React, { useEffect } from "react"
import { useStore } from "./data/store"
import GameState from "./data/const/GameState"

export default function Ui() {
    let state = useStore(state => state.data.state)
    let actions = useStore(state => state.actions)

    useEffect(() => {
        let listener = () => {
            switch (state) {
                case GameState.READY:
                    return actions.start() 
                case GameState.GAME_OVER:
                    return actions.reset()
            }
        }

        window.addEventListener("click", listener)

        return () => window.removeEventListener("click", listener)
    }, [state])

    return (
        <div id="ui">
            {state}
        </div>
    )
}