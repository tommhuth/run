import random from "@huth/random"
import Config from "../Config"
import BlockType from "./const/BlockType"

function getNextType(previous) {
    let types = Object.values(BlockType)
    let illegalNext = { 
        [BlockType.PLAIN]: [BlockType.PLAIN],
        [BlockType.OBSTACLES]: [],
        [BlockType.NARROW]: []
    }
    let type = random.pick(...types)

    while (illegalNext[previous.type].includes(type)) {
        type = random.pick(...types.filter(i => i !== type))
    }

    return type
}

const makeBlock = {
    [BlockType.PLAIN]() {
        return {
            depth: random.integer(10, 14),
            steps: [2, -2]
        }
    },
    [BlockType.OBSTACLES]() {
        return {
            depth: random.integer(20, 25),
            steps: [2, -2]
        }
    },
    [BlockType.NARROW](previous) {
        return {
            depth: previous.type === BlockType.NARROW ? 24 - (24 - Config.PLATFORM_DEPTH) / 2 : 24,
            width: 7,
            steps: [0]
        }
    }
}

export function getBlock(blocks) {
    let previous = blocks[0]
    let type = getNextType(previous)
    let block = {
        id: random.id(),
        start: previous.end,
        width: random.integer(Config.BLOCK_WIDTH, Config.BLOCK_WIDTH + Config.BLOCK_MAX_EXTRA_WIDTH),
        previousType: previous.type,
        type,
        ...makeBlock[type](previous)
    }
    let step = random.pick(...block.steps)

    if (previous.y <= -4 && step < 0) {
        step = 2
    }

    if (previous.type === BlockType.NARROW) {
        step = 0
    }

    return {
        ...block,
        end: block.start + block.depth,
        y: previous.y + step,
        step
    }
}