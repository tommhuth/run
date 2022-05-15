import create from "zustand"
import random from "@huth/random"
import BlockType from "./const/BlockType"
import GameState from "./const/GameState"

const mustRequestOrientationAccess = window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission

const store = create(() => ({
    hasDeviceOrientation: !mustRequestOrientationAccess,
    mustRequestOrientationAccess,
    state: mustRequestOrientationAccess ? GameState.REQUEST_ORIENTATION_ACCESS : GameState.READY,
    player: {
        position: [0, 6, 10],
    },
    blocks: [  
        {
            id: random.id(),
            type: BlockType.PLAIN,
            y: 4,
            x: 0,
            depth: 14,
            start: 6,
            width: 10,
            end: 20
        },
    ]
}))

export const useStore = store

export function start() {
    store.setState({ state: GameState.RUNNING })
}

export function end(reason) {
    let { player } = store.getState()

    store.setState({
        state: GameState.GAME_OVER,
        gameOverReason: reason,
        score: Math.floor(player.position[2])
    })
}

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

function getY(previousY, min = 0, max= 10) {
    if (previousY< min) {
        return previousY + 2
    }

    if (previousY> max) {
        return previousY - 2
    }

    return previousY + random.pick(-2, 0, 2)
}

function generateBlock(lastBlock) {
    let depth = random.integer(6, 8)

    return {
        id: random.id(),
        type: BlockType.PLAIN,
        width: random.pick(10, 14),
        y: getY(lastBlock.y),
        x: random.pick(-2, 0, 2), 
        depth,
        start: lastBlock.end,
        end: lastBlock.end + depth
    }
}

export function generatePath(forwardBuffer = 20, backwardBuffer = 10) {
    let { blocks, player } = store.getState()
    let lastBlock = blocks[0]
    let newBlocks = []

    if (lastBlock.end - player.position[2] < forwardBuffer) {
        let block = generateBlock(lastBlock)

        newBlocks.push(block)
    }

    store.setState({
        blocks: [
            ...newBlocks,
            ...blocks.filter(i => !(i.end < player.position[2] - backwardBuffer)),
        ]
    })
}