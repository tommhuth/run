import * as runActions from "./creators/run"
import uuid from "uuid"
import random from "../../utils/random"
import GameState from "../../const/GameState"
import BlockType from "../../const/BlockType"
import BlockSettings from "../../const/BlockSettings"

function isValidNext(previous, next) {
    return !BlockSettings[previous].illegalNext.includes(next)
}

function getNext(previous) {
    let types = Object.values(BlockType)
    let next = random.pick(types)

    while (!isValidNext(previous, next)) {
        next = random.pick(types)
    }

    return next
}

function addBlock(forceType) {
    return function (dispatch, getState) {
        let blocks = getState().run.blocks
        let last = blocks[blocks.length - 1]
        let type = forceType || getNext(last.type)
        let z = (last && last.z) || 0
        let lastDepth = (last && last.depth) || 0
        let depth = random.integer(...BlockSettings[type].depth)

        dispatch(runActions.addBlock({
            timestamp: new Date().getTime(),
            id: uuid.v4(),
            z: z + lastDepth,
            start: z + lastDepth,
            end: z + lastDepth + depth,
            depth: depth,
            type
        }))
    }
}

export function start() {
    return function (dispatch) {
        dispatch(runActions.setState(GameState.ACTIVE))
    }
}

export function increaseScore() {
    return function (dispatch) {
        dispatch(runActions.increaseScore())
    }
}

export function gameOver() {
    return function (dispatch) {
        dispatch(runActions.setState(GameState.GAME_OVER))
    }
}

export function reset() {
    return function (dispatch) {
        dispatch(runActions.reset())
        dispatch(generateInitalPath())
        dispatch(runActions.setState(GameState.ACTIVE))
        console.log("sdfsdfdsf")
    }
}

export function generateInitalPath() {
    return function (dispatch) {
        dispatch(addBlock("flat")) 
        dispatch(addBlock("flat"))
        dispatch(addBlock("flat"))
        dispatch(addBlock("flat"))
        dispatch(addBlock("flat"))
    }
}

export function generatePath(playerPosition) {
    return function (dispatch, getState) {
        let { blocks } = getState().run
        let last = blocks[blocks.length - 1] 

        for (let block of blocks) {
            if (block.end + 5 < playerPosition.z) {
                dispatch(runActions.removeBlock(block.id))
            }
        }

        if (last.end - playerPosition.z < 38) {
            dispatch(addBlock())
        }
    }
}
