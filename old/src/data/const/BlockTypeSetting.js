import BlockType from "./BlockType"

export default {
    [BlockType.PLAIN]: {
        likelyhood: .3,
        depth: [8, 15],
        illegalNext: [BlockType.PLAIN]
    },
    [BlockType.OBSTACLES]: {
        likelyhood: 1,
        depth: [8, 25],
        illegalNext: []
    },
    [BlockType.ENEMIES]: {
        likelyhood: .2,
        depth: [8, 15],
        illegalNext: [BlockType.ENEMIES]
    }
}