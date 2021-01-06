import random from "@huth/random"
import Config from "../Config"
import uuid from "uuid"
import BlockType from "./const/BlockType"

let i = 0

function getNextStep(blocks) {
    let next = i % 3 === 0 && i > 0 ? blocks[0].step : random.pick(-2, 2)

    return next
}

function getNextType(previous) {
    let types = [
        ...Object.values(BlockType).filter(i => i !== BlockType.START),
        BlockType.OBSTACLES,
        BlockType.OBSTACLES,
        BlockType.OBSTACLES,
        BlockType.OBSTACLES,
    ]
    let illegalNext = {
        [BlockType.START]: [BlockType.NARROW],
        [BlockType.PLAIN]: [BlockType.PLAIN],
        [BlockType.OBSTACLES]: [],
        [BlockType.NARROW]: []
    }
    let type = random.pick(...types)

    while (illegalNext[previous.type].includes(type)) {
        type = random.pick(...types)
    }

    return type
}

const makeBlock = {
    [BlockType.START]() {
        return {
            depth: 35
        }
    },
    [BlockType.PLAIN]() {
        return {
            depth: random.integer(7, 10)
        }
    },
    [BlockType.OBSTACLES]() {
        return {
            depth: random.integer(15, 20)
        }
    },
    [BlockType.NARROW](previous) {
        return {
            depth: previous.type === BlockType.NARROW ? 11 : 16,
            width: 7,
            stepUp: false
        }
    }
} 

export function getBlock(blocks) {
    let previous = blocks[0]
    let stepUp = [BlockType.NARROW].includes(previous.type) ? false : true //  random.boolean(.9)
    let type = getNextType(previous)
    let block = {
        id: uuid.v4(),
        start: previous.end,
        width: random.integer(Config.BLOCK_WIDTH, Config.BLOCK_WIDTH + Config.BLOCK_MAX_EXTRA_WIDTH),
        previousType: previous.type,
        stepUp,
        type,
        ...makeBlock[type](previous)
    }

    let step = getNextStep(blocks)

    i++

    return {
        ...block,
        end: block.start + block.depth,
        y: previous.y + (block.stepUp ? step : 0),
        step: block.stepUp ? step : 0
    }
}