import BlockType from "./BlockType"

export default {
    [BlockType.GAP]: {
        illegalNext: [BlockType.GAP]
    },
    [BlockType.EMPTY]: {
        illegalNext: []
    },
    [BlockType.PLAIN]: {
        illegalNext: []
    }
}