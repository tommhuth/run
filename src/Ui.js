import React from "react"
import { useStore } from "./data/store"

export default function Ui() {
    let state = useStore(state => state.data.state)
    let hasDeviceOrientation = useStore(state => state.data.hasDeviceOrientation)
    let mustRequestOrientationAccess = useStore(state => state.data.mustRequestOrientationAccess)

    return (
        <div id="ui">
            hasDeviceOrientation={JSON.stringify(hasDeviceOrientation)}<br />
            mustRequestOrientationAccess={JSON.stringify(mustRequestOrientationAccess)}<br /><br />
            {state}
        </div>
    )
}