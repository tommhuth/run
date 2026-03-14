import Config from "@data/Config"
import { store } from "@data/store"
import { setDebugData } from "@data/store/actions"
import { CSSProperties, useRef } from "react"
import useAnimationFrame from "use-animation-frame"

export default function Ui() {
    const player = store(i => i.player)
    const messages = store(i => i.messages)
    const timeRef = useRef<HTMLOutputElement>(null)
    const progressRef = useRef<HTMLDivElement>(null)

    useAnimationFrame(() => {
        if (!timeRef.current || !progressRef.current) {
            return
        }

        const time = Math.floor((player.pickupDeadline - Date.now()) / 100) * 100 / 1000
        const size = (player.pickupDeadline - Date.now()) / player.time

        timeRef.current.value = (time < 0 ? "−" : "") + Math.abs(time).toLocaleString("en") + "s"

        if (size < 0) {
            progressRef.current.style.animation = "blink .85s infinite"
            progressRef.current.style.scale = "1 1"
        } else {
            progressRef.current.style.animation = ""
            progressRef.current.style.scale = `${size > 0 ? size : 1} 1`
        }
    })

    return (
        <>
            <div className="distance">
                <output ref={timeRef} hidden={player.pickupDeadline === Infinity} />
                <output hidden={!player.score}>{player.score.toLocaleString("en")}</output>
            </div>

            <div
                hidden={player.pickupDeadline === Infinity}
                ref={progressRef}
                className="progress"
            />

            <ul className="messages">
                {messages.map(i => {
                    return (
                        <li
                            key={i.id}
                            style={{
                                "--color": i.score < 0 ? "#ff0084" : undefined
                            } as CSSProperties}
                        >
                            <div>{i.text}</div>
                            <strong hidden={!i.score}>
                                {((i.score || 0) < 0 ? "−" : "+")}{Math.abs(i.score || 0).toLocaleString("en")}
                            </strong>
                        </li>
                    )
                })}
            </ul>
            {Config.DEBUG && <Debug />}
        </>
    )
}

function Debug() {
    const state = store(i => i.state)
    const { godMode, showColliders } = store(i => i.debug)
    const player = store(i => i.player)
    const road = store(i => i.road)

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
            <div>pickupCounter: {player.pickupCounter}</div>
            <div>pickupInterval: {player.pickupInterval}</div>
            <div>
                <ul style={{ fontSize: ".85em" }}>
                    {road.map((i, index) => <div key={i.id}>{index + 1} {i.type}</div>)}
                </ul>
            </div>
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
