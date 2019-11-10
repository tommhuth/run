import React from "react"
import { useStore } from "./data/store"

export default function Ui() {
    let state = useStore(state => state.data.state)
    let { z } = useStore(state => state.data.position)

    return (
        <div id="ui">
            {state}<br /><br />
            {Math.floor(z - 8 < 0 ? 0 : (z - 8)/2)}m<br />
        </div>
    )
}