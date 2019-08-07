export function getState(state) {
    return state.run.state
} 

export function getBlocks(state) {
    return state.run.blocks.sort((a, b) => a.timestamp - b.timestamp)
}

export function getScore(state) {
    return state.run.score
} 
