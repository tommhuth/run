import * as runActions from "./creators/run"
import Config from "../../Config"
import uuid from "uuid"
import random from "../../utils/random"

const BlockType = {
    FLAT: "flat",
    GAP: "gap"
}

const BlockSettings = {
    [BlockType.GAP]: {
        requiredNext: [],
        depth: [2,5],
        illegalNext: [BlockType.GAP]
    },
    [BlockType.FLAT]: {
        requiredNext: [],
        depth: [14,30],
        illegalNext: []
    }
}

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

export function addBlock(
    forceType
) {
    return async function (dispatch, getState) {
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

export function init() {
    return async function (dispatch) {
        dispatch(addBlock("flat"))
        dispatch(addBlock("flat"))
        dispatch(addBlock("gap"))
        dispatch(addBlock("flat"))
        dispatch(addBlock("flat"))
        dispatch(addBlock("gap"))
    }
}

export function setPlayerPosition(position) {
    return async function (dispatch) {
        dispatch(runActions.setPlayerPosition(position))
    }
}
export function setBlockDepth(id, depth) {
    return async function (dispatch) {
        dispatch(runActions.setBlockDepth(id, depth))
    }
}

export function clean() {
    return async function (dispatch, getState) {
        let { blocks, playerPosition } = getState().run

        for (let block of blocks) {
            if (block.end + 5 < playerPosition.z) {
                dispatch(runActions.removeBlock(block.id))
                dispatch(addBlock())
            }
        }
    }
}
