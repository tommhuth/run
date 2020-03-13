import uuid from "uuid"
import BlockType from "./const/BlockType"
import BlockTypeSetting from "./const/BlockTypeSetting"
import random from "./random"

export default function getBlock(previous) {
    let blocks = [...Object.values(BlockType), BlockType.OBSTACLES]
    let options = {
        type: random.pick(blocks),
        id: uuid.v4(),
        start: previous.end
    } 

    while (BlockTypeSetting[previous.type].illegalNext.includes(options.type)) { 
        options.type = random.pick(blocks)
    }

    options.depth = random.integer(...BlockTypeSetting[options.type].depth)

    return {
        ...options,
        end: options.start + options.depth,
        y: random.pick([0, 2]) + previous.y
    }
}