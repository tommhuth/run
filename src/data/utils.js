import random from "@huth/random"
import Config from "../Config"
import uuid from "uuid"
import BlockType from "./const/BlockType"

function getNextType(previous) {
    let types = [
        ...Object.values(BlockType).filter(i => i !== BlockType.START),
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
        type = random.pick(...types.filter(i => i !== type))
    }

    return type
}

const makeBlock = {
    [BlockType.PLAIN]() {
        return {
            depth: random.integer(10, 14),
            stepChange: true
        }
    },
    [BlockType.OBSTACLES]() {
        return {
            depth: random.integer(20, 25),
            stepChange: true
        }
    },
    [BlockType.NARROW](previous) {
        return {
            depth: previous.type === BlockType.NARROW ? 18 - (18 - Config.PLATFORM_DEPTH) / 2 : 18,
            width: 7,
            stepChange: false
        }
    }
}

export function getBlock(blocks) {
    let previous = blocks[0]
    let type = getNextType(previous)
    let block = {
        id: uuid.v4(),
        start: previous.end,
        width: random.integer(Config.BLOCK_WIDTH, Config.BLOCK_WIDTH + Config.BLOCK_MAX_EXTRA_WIDTH),
        previousType: previous.type,
        type,
        ...makeBlock[type](previous)
    }
    let step = previous.type === BlockType.NARROW ? 0 : random.pick(-2, 2)

    return {
        ...block,
        end: block.start + block.depth,
        y: previous.y + (block.stepChange && previous.y > -4 ? step : previous.y <= -4 ? 2 : 0),
        step: block.stepChange ? step : 0
    }
}