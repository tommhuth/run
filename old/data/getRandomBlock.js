import uuid from "uuid"
import random from "./random"
import BlockSettings from "./const/BlockSettings"
import BlockType from "./const/BlockType"

export default function getRandomBlock(previous) {
    let blocks = Object.values(BlockType)
    let options = {
        type: random.pick(blocks),
        id: uuid.v4(),
        start: previous.end
    }

    while (!random.bool(BlockSettings[previous.type].likelihood) || BlockSettings[previous.type].illegalNext.includes(options.type)) {
        options.type = random.pick(blocks.filter(i => i !== options.type)) 
    }

    switch (options.type) {
        case BlockType.PILLARS:
            options.depth = random.integer(10, 36)
            break 
        case BlockType.STEPS:
            options.depth = random.integer(14, 30)
            break
        case BlockType.PLAIN:
            options.depth = random.integer(6, 12)
            break
        case BlockType.GAP:
            options.depth = random.real(1, 2)
            break
    }

    options.end = options.start + options.depth

    return options
}