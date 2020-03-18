import React from "react"
import { useStore } from "../data/store"
import Only from "./Only"

import "./style/game-over-stats.scss"

export default function GameOverStats() {
    let score = useStore(state => state.data.score)
    let hasNewPersonalBest = useStore(state => state.data.hasNewPersonalBest)

    return (
        <div className="game-over-stats"> 
            <Only if={hasNewPersonalBest}>
                <div className="game-over-stats__personal-best">New personal best</div>
            </Only> 
            <div className="game-over-stats__score">{score} meters</div>
        </div>
    )
}