import React from "react"
import Config from "../Config"
import { useStore } from "../data/store"
import GameState from "../data/const/GameState" 

export default function Ui() {
    let state = useStore(state => state.state)
    let gameOverReason = useStore(state => state.gameOverReason)
    let score = useStore(state => state.score)
    let buildTime = new Date(Config.BUILD_TIME)

    if (state === GameState.READY) {
        //return <TitleCard lines={["Run,", "Britney"]} big />
    }   

    return ( 
        <div className="ui">
            {state} {gameOverReason ? <>({gameOverReason})</> : null}<br />
            Score: {score} <br />
            Built @ {buildTime.getDate().toString().padStart(2, "0")}.{buildTime.getMonth().toString().padStart(2, "0")} {buildTime.getHours().toString().padStart(2, "0")}:{buildTime.getMinutes().toString().padStart(2, "0")} <br />
            <button onClick={() => location.reload(true)}>Reload</button>
        </div>
    )
}