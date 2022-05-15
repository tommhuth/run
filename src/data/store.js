import create from "zustand"
import random from "@huth/random"

const store = create(() => ({
    player: {
        position: [0, 0, 0], 
    },
    state: "running",
    path: [
        {
            id: random.id(),
            y: 0,
            x: 0,
            depth: 8,
            start: 8,
            end: 16
        },
        {
            id: random.id(),
            y: 0,
            x: 0,
            depth: 8,
            start: 0,
            end: 8
        },
    ]
}))

export function setPlayerPosition(position) {
    store.setState({
        player: {
            ...store.getState().player,
            position
        }
    })
}

export function setState(state) {
    store.setState({
        state
    })
}


function generateBlock(lastBlock) {
    let depth = 8

    return {
        id: random.id(),
        y: lastBlock.y + random.pick(-2, 2),
        x: lastBlock.x + random.pick(-1, 1),
        depth,
        start: lastBlock.end,
        end: lastBlock.end + depth
    }
}

export function generatePath() {
    let { path, player } = store.getState()
    let lastBlock = path[0]
    let forwardBuffer = 20
    let backwardBuffer = 10
    let newBlocks = []

    if (lastBlock.end - player.position[2] < forwardBuffer) {
        let block = generateBlock(lastBlock)

        newBlocks.push(block)
    }

    store.setState({
        path: [
            ...newBlocks,
            ...path.filter(i => !(i.end < player.position[2] - backwardBuffer)),
        ]
    })
}

export default store