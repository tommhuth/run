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
                start: 20,
                type: BlockType.PLAIN,
                active: true,
                y: 0,
                end: 60
            }, 
            {
                id: uuid.v4(),
                depth: 10,
                start: 60,
                type: BlockType.PLAIN,
                y: 2,
                end: 70
            },
            {
                id: uuid.v4(),
                depth: 10,
                start: 70,
                type: BlockType.ENEMIES,
                y: 4,
                end: 80
            }, 
        ],
        hasDeviceOrientation: !mustRequestOrientationAccess,
        mustRequestOrientationAccess,
        state: mustRequestOrientationAccess ? GameState.REQUEST_ORIENTATION_ACCESS : GameState.READY,
        score: 0,
        attempts: 0,
        time: 1000 * 20,
        reason: null,
        position: { x: 0, y: 0, z: 30 }
    }
}