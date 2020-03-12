import uuid from "uuid"
import GameState from "./const/GameState"
import BlockType from "./const/BlockType"

export default function getInitState() {
    let mustRequestOrientationAccess = window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission

    return {
        blocks: [
            {
                id: uuid.v4(),
                depth: 40,
                start: -30,
                type: BlockType.PLAIN,
                y: 0,
                end: 10
            },

            {
                id: uuid.v4(),
                depth: 10,
                start: 10,
                type: BlockType.PLAIN,
                y: 2,
                end: 20
            },
            {
                id: uuid.v4(),
                depth: 10,
                start: 20,
                type: BlockType.ENEMIES,
                y: 4,
                end: 30
            },
            {
                id: uuid.v4(),
                depth: 20,
                start: 30,
                type: BlockType.ENEMIES,
                y: 4,
                end: 50
            },
            {
                id: uuid.v4(),
                depth: 25,
                start: 50,
                type: BlockType.ENEMIES,
                y: 6,
                end: 75
            }
        ],
        hasDeviceOrientation: !mustRequestOrientationAccess,
        mustRequestOrientationAccess,
        state: mustRequestOrientationAccess ? GameState.REQUEST_ORIENTATION_ACCESS : GameState.READY,
        score: 0,
        attempts: 0,
        position: { x: 0, y: 0, z: 7 }
    }
}