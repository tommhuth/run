import { RunAction } from "../actions/creators/run"
import GameState from "../../const/GameState"

const init = {
    state: GameState.READY,
    blocks: [],
    playerPosition: { x: 0, y: 0, z: 0 }
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
        case RunAction.SET_PLAYER_POSITION:
            return {
                ...state,
                playerPosition: { ...state.playerPosition, ...payload }
            } 
        default:
            return state
    }
}
