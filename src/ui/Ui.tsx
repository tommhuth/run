import { store } from "@data/store"
import { useRef } from "react"
import useAnimationFrame from "use-animation-frame"

export default function Ui() {
    const player = store(i => i.player)
    const ref = useRef<HTMLDivElement>(null)

    useAnimationFrame(() => {
        if (!ref.current) {
            return
        }

        ref.current.innerText = Math.floor(player.vehicle?.chassisBody.position.z || 0) + " m"
    })

    return (
        <>
            <div
                style={{
                    position: "absolute",
                    left: "2em",
                    bottom: "3em",
                }}
                ref={ref}
            >
            </div>
        </>
    )
}

function Debug() {
    const state = store(i => i.state)

    return (
        <div
            style={{
                position: "absolute",
                bottom: "100%",
                marginBottom: "1em",
            }}
        >
            <div>{state}</div>
        </div>
    )
}
