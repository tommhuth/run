import BlockType from "./BlockType"

export default {
    [BlockType.GAP]: {
        illegalNext: [BlockType.GAP, BlockType.STEPS]
    },
    [BlockType.BASE_TOWER]: {
        illegalNext: []
    },
    [BlockType.PLAIN]: {
        illegalNext: []
    },
    [BlockType.STEPS]: {
        illegalNext: [BlockType.STEPS]
    }
}