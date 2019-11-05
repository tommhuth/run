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

    while (BlockSettings[previous.type].illegalNext.includes(options.type)) {
        options.type = random.pick(blocks)
    }

    switch (options.type) {
        case BlockType.BASE_TOWER:
            options.depth = random.integer(4, 10)
            break
        case BlockType.STEPS:
            options.depth = random.integer(14, 30)
            break
        case BlockType.PLAIN:
            options.depth = random.integer(7, 14)
            break
        case BlockType.GAP:
            options.depth = random.real(1, 2.5)
            break
    }

    options.end = options.start + options.depth

    return options
}