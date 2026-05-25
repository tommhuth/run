import Config from "@data/Config"
import { setDebugData } from "@data/store/actions/actions"
import { store } from "@data/store/store"
import clsx from "clsx"
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

        const currentTime = Math.floor((player.deadline - Date.now()) / 100) * 100 / 1000
        const t = currentTime / player.time

        timeRef.current.value = (currentTime < 0 ? "−" : "") + Math.abs(currentTime).toLocaleString("en") + "s"

        if (t < 0) {
            progressRef.current.style.animation = "blink .85s infinite"
            progressRef.current.style.scale = "1 1"
        } else {
            progressRef.current.style.animation = ""
            progressRef.current.style.scale = `${t > 0 ? t : 1} 1`
        }
    })

    return (
        <>
            <div className="fixed left-4 right-4 bottom-10 text-2xl text-black flex gap-4">
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
                    hidden={player.deadline === -1}
                />
            </div>

            <div
                hidden={player.deadline === -1}
                ref={progressRef}
                className="fixed left-4 right-4 bottom-8 h-0.75 bg-black origin-left rounded-full"
            />

            <ul
                className={clsx(
                    "absolute top-8 left-1/2 -translate-x-1/2",
                    "w-[calc(100%-2em)] flex flex-col gap-2 place-items-center",
                    "text-xl max-md:text-base empty:hidden",
                )}
            >
                {messages.map(i => {
                    return (
                        <li
                            aria-live="polite"
                            key={i.id}
                            style={{
                                "--color": i.score && i.score < 0 ? "#ff0084" : undefined
                            } as CSSProperties}
                            className={clsx(
                                "flex w-max flex-wrap max-w-full animate-messagein",
                                "max-md:flex-col-reverse max-md:place-items-center",
                            )}
                        >
                            <div
                                className={clsx(
                                    "bg-black text-white py-3 px-5 rounded-lg",
                                    "relative z-1 -mr-2",
                                    "max-md:mr-0 max-md:-mt-1 max-md:-z-1",
                                )}
                            >
                                {i.text}
                            </div>
                            <strong
                                className="font-bold bg-(--color,blue) text-white rounded-lg max-w-max py-3 px-6 empty:hidden"
                                hidden={!i.score}
                            >
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
        <div className="absolute top-4 left-4 text-black flex flex-col gap-2 pointer-events-auto">
            <div>{state.toUpperCase()}</div>
            <div>nextTargetAt: {player.nextTargetAt}</div>
            <div>targetDistance: {player.targetDistance}</div>
            <div>time: {player.time.toFixed(1)}</div>
            <div>
                <ul className="text-md">
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
