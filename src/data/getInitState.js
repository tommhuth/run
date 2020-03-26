import uuid from "uuid"
import GameState from "./const/GameState"
import BlockType from "./const/BlockType"
import LocalStorage from "./LocalStorage"

export default function getInitState() {
    let mustRequestOrientationAccess = window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission

    return {
        blocks: [
            {
                id: uuid.v4(),
                depth: 75,
                start: -10,
                type: BlockType.START,
                active: true,
                y: 0,
                end: 65
            },
            {
                id: uuid.v4(),
                depth: 10,
                active: true,
                start: 65,
                type: BlockType.PLAIN,
                y: 2,
                end: 75
            },
        ],
        hasDeviceOrientation: !mustRequestOrientationAccess,
        mustRequestOrientationAccess,
        state: mustRequestOrientationAccess ? GameState.REQUEST_ORIENTATION_ACCESS : GameState.INTRO,
        score: 0,
        attempts: 0,
        time: 1000 * 20,
        reason: null,
        position: { x: 0, z: 40, y: 6 },
        personalBest: LocalStorage.get("run-best"),
        hasNewPersonalBest: false,
        trauma: [0]
    }
}