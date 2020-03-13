import uuid from "uuid"
import BlockType from "./const/BlockType"
import BlockTypeSetting from "./const/BlockTypeSetting"
import random from "./random"

let countSinceCoins = 0

export default function getBlock(previous) {
    let blocks = countSinceCoins > 3 ? [BlockType.PLAIN] : [...Object.values(BlockType)]
    let options = {
        type: random.pick(blocks),
        id: uuid.v4(),
        start: previous.end
    } 

    while (!random.bool(BlockTypeSetting[options.type].likelyhood) || BlockTypeSetting[previous.type].illegalNext.includes(options.type)) { 
        options.type = random.pick(blocks)
    }

    options.depth = random.integer(...BlockTypeSetting[options.type].depth)

    if (options.type !== BlockType.PLAIN) {
        countSinceCoins++
    } else {
        countSinceCoins = 0
    } 

    return {
        ...options,
        end: options.start + options.depth,
        y: random.pick([0, 2]) + previous.y
    }
}