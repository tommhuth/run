import BlockType from "./BlockType"
import Config from "../Config"

export default {
    BASE_HEIGHT: 20,

    [BlockType.GAP]: {
        requiredNext: [],
        depth: [.5, Config.MAX_GAP],
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
