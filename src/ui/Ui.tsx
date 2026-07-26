import Config from "@data/Config"
import { store, useStore } from "@data/store/store"
import { clamp } from "@data/utils"
import { useRef } from "react"
import useAnimationFrame from "use-animation-frame"

import Debug from "./Debug"

const isTouch = typeof window !== "undefined"
    && window.matchMedia("(pointer: coarse)").matches

export default function Ui() {
    const player = store(i => i.player)
    const loading = store(i => i.loading)
    const state = store(i => i.state)
    const timeRef = useRef<HTMLOutputElement>(null)
    const distanceRef = useRef<HTMLOutputElement>(null)
    const progressRef = useRef<HTMLDivElement>(null)
    const hideHud = loading || state === "intro"

    useAnimationFrame(() => {
        const { player } = useStore.getState()

        if (!distanceRef.current || !timeRef.current || !progressRef.current || !player.vehicle) {
            return
        }

        const currentTime = (player.deadline - Date.now()) / 1000
        const t = currentTime / player.time
        const displayTime = clamp(Math.floor(currentTime * 10) / 10, -100, Infinity)
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

    return (
        <>
            <div
                style={{ display: !loading && state === "intro" ? undefined : "none" }}
                className="fixed md:left-[6vw] md:right-[6vw] left-8 right-8  md:bottom-[7vh] bottom-10"
            >
                <h1 className=" text-[1.15em] leading-[1.1]">
                    Untitled infinite runner
                </h1>
                <p className=" mt-[.1em] leading-normal text-[1em]">
                    {isTouch ? "Drag to steer towards " : "Use keyboard to reach "} the target destination ahead.
                </p>
            </div>

            <div
                className="fixed left-8 right-8 md:left-[6vw] md:right-[6vw] mb-4 md:bottom-[7vh] bottom-10 text-[1.25em] md:text-[1.5em] flex gap-6"
                style={{ display: hideHud ? "none" : undefined }}
            >
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
                style={{ display: hideHud ? "none" : undefined }}
                className="fixed left-8 right-8 md:left-[6vw] md:right-[6vw] md:bottom-[7vh] bottom-10 h-0.5 bg-[currentColor] origin-left rounded-full"
            />

            {Config.DEBUG && <Debug />}
        </>
    )
}
