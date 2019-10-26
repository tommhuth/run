import uuid from "uuid"
import random from "./random"
import BlockSettings from "./const/BlockSettings"
import BlockType from "./const/BlockType"

export default function getBlock(previous) {
    let blocks = Object.values(BlockType)
    let options = {
        type: random.pick(blocks),
        id: uuid.v4(),
        start: previous.end
    }

    while (previous && BlockSettings[previous.type].illegalNext.includes(options.type)) {
        options.type = random.pick(blocks)
    }

    switch (options.type) {
        case BlockType.EMPTY:
            options.depth = random.integer(4, 10)
            break
        case BlockType.GAP:
            options.depth = random.real(1, 2.5)
            break
    }

    options.end = options.start + options.depth

    return options
}