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
        depth: [14, 30],
        illegalNext: []
    }, 
    [BlockType.PLATFORMS]: {
        requiredNext: [],
        depth: [45, 100],
        illegalNext: [BlockType.GAP]
    }
}
