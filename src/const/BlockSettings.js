import BlockType from "./BlockType"

export default {
    BASE_HEIGHT: 50,

    [BlockType.GAP]: {
        requiredNext: [],
        depth: [2, 5],
        illegalNext: [BlockType.GAP, BlockType.PLATFORMS]
    },
    [BlockType.FLAT]: {
        requiredNext: [],
        depth: [14, 14],
        illegalNext: []
    }, 
    [BlockType.PLATFORMS]: {
        requiredNext: [],
        depth: [20, 100],
        illegalNext: [BlockType.GAP]
    }
}
