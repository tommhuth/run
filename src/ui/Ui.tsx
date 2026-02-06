import Config from "@data/Config"
import { store } from "@data/store"
import { setDebugData } from "@data/store/actions"
import { useRef } from "react"
import useAnimationFrame from "use-animation-frame"

export default function Ui() {
    const player = store(i => i.player)
    const ref = useRef<HTMLDivElement>(null)

    useAnimationFrame(() => {
        if (!ref.current) {
            return
        }

        ref.current.innerText = Math.max(Math.floor(player.vehicle?.chassisBody.position.z || 0), 0).toString()
    })

    return (
        <>
            <div className="distance">
                <span ref={ref} /><span>m</span>
            </div>

            {Config.DEBUG && <Debug />}
        </>
    )
}

function Debug() {
    const state = store(i => i.state)
    const { godMode, showColliders } = store(i => i.debug)

    return (
        <div
            style={{
                position: "absolute",
                top: "1em",
                left: "1em",
                color: "black",
                display: "flex",
                gap: ".5em",
                flexFlow: "column wrap"
            }}
        >
            <div>{state.toUpperCase()}</div>

            <label>
                <input
                    type="checkbox"
                    checked={godMode}
                    onChange={e => setDebugData("godMode", e.currentTarget.checked)}
                /> God mode
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={showColliders}
                    onChange={e => setDebugData("showColliders", e.currentTarget.checked)}
                /> Show colliders
            </label>
        </div>
    )
}
