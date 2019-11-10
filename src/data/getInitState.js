import uuid from "uuid"
import GameState from "./const/GameState"
import BlockType from "./const/BlockType"

export default function getInitState() {
    let mustRequestOrientationAccess = window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission

    return {
        blocks: [
            {
                id: uuid.v4(),
                type: BlockType.PLAIN,
                depth: 8,
                start: 0,
                end: 8
            },
            {
                id: uuid.v4(),
                type: BlockType.PLAIN,
                depth: 11,
                start: 8,
                end: 19
            },
            {
                id: uuid.v4(),
                type: BlockType.PILLARS,
                depth: 20,
                start: 19,
                end: 39
            }
        ],
        hasDeviceOrientation: !mustRequestOrientationAccess,
        mustRequestOrientationAccess,
        spheres: [],
        state: mustRequestOrientationAccess ? GameState.REQUEST_ORIENTATION_ACCESS : GameState.READY,
        lives: 3,
        attempts: 0,
        score: 0,
        bombs: 0,
        position: { x: 0, y: 0, z: 7 },
        baseY: 0,
    }
}