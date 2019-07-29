export const RunAction = {
    SET_STATE: "run:set-state", 
    ADD_BLOCK: "run:add-block",
    REMOVE_BLOCK: "run:remove-block",
    SET_PLAYER_POSITION: "silent@run:set-player-position", 
    RESET: "run:reset",
}

export function reset() {
    return {
        type: RunAction.RESET
    }
} 

export function setState(state) {
    return {
        type: RunAction.SET_STATE,
        payload: state
    }
} 

export function setPlayerPosition(position) {
    return {
        type: RunAction.SET_PLAYER_POSITION,
        payload: position
    }
} 

export function addBlock(block) {
    return {
        type: RunAction.ADD_BLOCK,
        payload: block
    }
} 

export function removeBlock(id) {
    return {
        type: RunAction.REMOVE_BLOCK,
        payload: id
    }
} 
