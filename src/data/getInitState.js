import uuid from "uuid"
import GameState from "./const/GameState" 

export default function getInitState() {
    let mustRequestOrientationAccess = window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission

    return {
        blocks: [
            {
                id: uuid.v4(), 
                depth: 20,
                start: -20,
                y: -2,
                end: 0
            }, 
            {
                id: uuid.v4(), 
                depth: 20,
                start: 0,
                y: 0,
                end: 20
            }, 
        ],
        hasDeviceOrientation: !mustRequestOrientationAccess,
        mustRequestOrientationAccess, 
        state: mustRequestOrientationAccess ? GameState.REQUEST_ORIENTATION_ACCESS : GameState.READY,
        score: 0, 
        position: { x: 0, y: 0, z: 7 }
    }
}