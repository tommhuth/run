import BlockType from "./BlockType"

export default {
    BASE_HEIGHT: 50,

    [BlockType.GAP]: {
        requiredNext: [],
        depth: [2, 5],
        illegalNext: [BlockType.GAP]
    },
    [BlockType.FLAT]: {
        requiredNext: [],
        depth: [10, 18],
        illegalNext: []
    }, 
    [BlockType.PLATFORMS]: {
        requiredNext: [],
        depth: [20, 100],
        illegalNext: [BlockType.GAP]
    }
}
