import Config from "@data/Config"
import { setDebugData } from "@data/store/actions/actions"
import { store, useStore } from "@data/store/store"
import { useRef } from "react"
import useAnimationFrame from "use-animation-frame"

export default function Ui() {
    const player = store(i => i.player)
    const loading = store(i => i.loading)
    const state = store(i => i.state)
    const timeRef = useRef<HTMLOutputElement>(null)
    const distanceRef = useRef<HTMLOutputElement>(null)
    const progressRef = useRef<HTMLDivElement>(null)

    useAnimationFrame(() => {
        const { player } = useStore.getState()

        if (!distanceRef.current || !timeRef.current || !progressRef.current || !player.vehicle) {
            return
        }

        const currentTime = (player.deadline - Date.now()) / 1000
        const t = currentTime / player.time
        const displayTime = Math.floor(currentTime * 10) / 10
        const distance = Math.max(Math.floor(player.vehicle?.chassisBody.position.z), 0)

        timeRef.current.value = (displayTime < 0 ? "−" : "") + Math.abs(displayTime).toLocaleString("en") + "s"

        distanceRef.current.value = distance.toLocaleString("en") + "m"

        if (t < 0) {
            progressRef.current.style.animation = "blink .85s infinite"
            progressRef.current.style.scale = "1 1"
        } else {
            progressRef.current.style.animation = ""
            progressRef.current.style.scale = `${t > 0 ? t : 1} 1`
        }
    })

    if (loading) {
        return null
    }

    if (state === "intro") {
        return (
            <h1 className="fixed tracking-tighter text text-[#050038] animate-intro left-[50%] top-[50%] text-[20vw] translate-[-50%]">
                Run
            </h1>
        )
    }

    return (
        <>
            <div className="fixed left-6 right-6 bottom-10 text-2xl text-black flex gap-4">
                <output
                    aria-label="Score"
                    className="font-bold"
                    hidden={!player.score}
                >
                    {player.score.toLocaleString("en")}
                </output>
                <output
                    ref={timeRef}
                    aria-label="Deadline"
                    hidden={player.deadline === Infinity}
                />
                <output
                    aria-label="Player position"
                    ref={distanceRef}
                    className="ml-auto"
                />
                <output aria-label="Next target at">
                    {player.nextTargetAt.toLocaleString("en")}m
                </output>
            </div>

            <div
                hidden={player.deadline === Infinity}
                ref={progressRef}
                className="fixed left-6 right-6 bottom-8 h-0.75 bg-black origin-left rounded-full"
            />

            {Config.DEBUG && <Debug />}
        </>
    )
}

function Debug() {
    const state = store(i => i.state)
    const { godMode, showColliders, physicsTime } = store(i => i.debug)
    const player = store(i => i.player)
    const road = store(i => i.road)

    return (
        <div className="absolute top-4 left-4 text-black flex flex-col gap-2 pointer-events-auto">
            <div>{state.toUpperCase()}</div>
            <div>nextTargetAt: {player.nextTargetAt}</div>
            <div>targetDistance: {player.targetDistance}</div>
            <div>time: {player.time.toFixed(1)}</div>
            <div>physicsTime: {physicsTime.toFixed(3)}ms</div>
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
            <div>
                <ul className="text-md">
                    {road.map((i, index) => <div key={i.id}>{index + 1} {i.type}</div>)}
                </ul>
            </div>
        </div>
    )
}
