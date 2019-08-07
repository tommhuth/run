import { RunAction } from "../actions/creators/run"
import GameState from "../../const/GameState"

const init = {
    state: GameState.READY,
    score: 0,
    blocks: []
}

export default function (state = { ...init }, { type, payload }) {
    switch (type) {
        case RunAction.SET_STATE:
            return {
                ...state,
                state: payload
            }
        case RunAction.RESET:
            return {
                ...init
            }
        case RunAction.INCREASE_SCORE:
            return {
                ...state,
                score: state.score + 1
            }
        case RunAction.ADD_BLOCK:
            return {
                ...state,
                blocks: [...state.blocks, payload]
            }
        case RunAction.REMOVE_BLOCK:
            return {
                ...state,
                blocks: state.blocks.filter(i => i.id !== payload)
            } 
        default:
            return state
    }
}
