import BlockType from "./BlockType"

export default {
    [BlockType.GAP]: {
        likelihood: 1,
        illegalNext: [
            BlockType.GAP, 
            BlockType.STEPS,
            BlockType.PILLARS
        ]
    }, 
    [BlockType.PLAIN]: {
        likelihood: 1,
        illegalNext: []
    },
    [BlockType.STEPS]: {
        likelihood: 1,
        illegalNext: [BlockType.STEPS]
    },
    [BlockType.PILLARS]: {
        likelihood: .45,
        illegalNext: [BlockType.GAP]
    }
}