import BlockType from "./BlockType"

export default {
    BASE_HEIGHT: 20,

    [BlockType.GAP]: {
        requiredNext: [],
        depth: [1, 2.5],
        illegalNext: [BlockType.GAP, BlockType.PLATFORMS]
    },
    [BlockType.FLAT]: {
        requiredNext: [],
        depth: [5, 7],
        illegalNext: []
    }, 
    [BlockType.PLATFORMS]: {
        requiredNext: [],
        depth: [10, 50],
        illegalNext: [BlockType.GAP]
    }
}
