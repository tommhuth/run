import { ROAD_FORWARD_EDGE } from "@components/road/const"
import Config from "@data/Config"
import { setDebugData } from "@data/store/actions/actions"
import { removeTrafficElement } from "@data/store/actions/traffic"
import { store, useStore } from "@data/store/store"
import { extractRotation } from "@data/utils"
import { useRef } from "react"
import useAnimationFrame from "use-animation-frame"

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

    return (
        <>
            <h1
                className="fixed tracking-tighter text text-[#050038] animate-intro left-[50%] top-[50%] text-[20vw] translate-[-50%]"
                style={{ display: !loading && state === "intro" ? undefined : "none" }}
            >
                Run
            </h1>

            <div
                className="fixed left-6 right-6 bottom-10 text-2xl text-black flex gap-4"
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
                className="fixed left-6 right-6 bottom-8 h-0.75 bg-black origin-left rounded-full"
            />

            {Config.DEBUG && <Debug />}
        </>
    )
}

function Debug() {
    const state = store(i => i.state)
    const { godMode, showColliders, physicsTime, bodies } = store(i => i.debug)
    const traffic = store(i => i.traffic)
    const player = store(i => i.player)
    const road = store(i => i.road)
    const partsRef = useRef<HTMLUListElement>(null)
    const trafficRef = useRef<HTMLDivElement>(null)
    const playerOrigin = 85
    const scale = .0085

    useAnimationFrame(() => {
        const { player, road, traffic } = store.getState()

        if (!player.vehicle || !trafficRef.current) {
            return
        }

        const playerZ = player.vehicle.chassisBody.position.z

        for (let i = 0; i < road.length; i++) {
            const { position, depth } = road[i]

            if (playerZ >= position[2] && playerZ < position[2] + depth) {
                partsRef.current?.children[i].classList.add("font-bold")
            } else {
                partsRef.current?.children[i].classList.remove("font-bold")
            }
        }

        for (let i = 0; i < traffic.length; i++) {
            const { vehicle, direction, id } = traffic[i]

            if (!vehicle) {
                break
            }

            const y = (vehicle.chassisBody.position.z - playerZ) * scale
            const el = trafficRef.current.children[direction === 1 ? 1 : 0].querySelector("#t" + id) as HTMLElement

            el.style.top = (-y * 100 + playerOrigin) + "%"
            el.style.rotate = extractRotation(vehicle.chassisBody.quaternion).y + "rad"
        }
    })

    return (
        <div className="text-shadow-[#fff7] text-shadow-xs absolute top-4 w-45 left-4 overflow-hidden text-black flex flex-col gap-1 pointer-events-auto">
            <div className="p-1 px-2 relative z-1 rounded-sm text-[blue] font-bold bg-[#0002] text-sm">
                {state.toUpperCase()}
            </div>
            <div className="mt-2 relative z-1">nextTargetAt: {player.nextTargetAt}m</div>
            <div className="relative z-1">targetDistance: {player.targetDistance}m</div>
            <div className="relative z-1">physicsTime: {physicsTime.toFixed(2)}ms</div>
            <div className="relative z-1">bodies: {bodies}</div>
            <label className="relative mt-2 z-1">
                <input
                    type="checkbox"
                    checked={godMode}
                    onChange={e => setDebugData("godMode", e.currentTarget.checked)}
                /> God mode
            </label>
            <label className="relative z-1">
                <input
                    type="checkbox"
                    checked={showColliders}
                    onChange={e => setDebugData("showColliders", e.currentTarget.checked)}
                /> Show colliders
            </label>
            <div
                ref={trafficRef}
                className="mt-2 h-60 w-[50%] relative flex bg-[#000A] rounded-sm"
            >
                {[-1, 1].map(side => {
                    return (
                        <div
                            key={side}
                            className="h-full relative flex-1"
                        >
                            {traffic.map(({ direction, id, vehicle }) => {
                                if (direction === side && vehicle) {
                                    return (
                                        <div
                                            key={id}
                                            id={"t" + id}
                                            onClick={() => removeTrafficElement(id)}
                                            title={"#" + id.substring(id.length - 4)}
                                            className="border-black border cursor-pointer w-2 h-3 rounded-sm translate-[-50%] absolute left-[50%] bg-[yellow]"
                                        />
                                    )
                                }

                                return null
                            })}
                        </div>
                    )
                })}
                <div
                    className="h-px z-1 w-full bg-[lime] absolute left-0"
                    style={{ top: `${playerOrigin}%` }}
                />
                <div
                    className="h-px z-1 w-full bg-[white] absolute left-0"
                    style={{ top: `${-ROAD_FORWARD_EDGE * scale * 100 + playerOrigin}%` }}
                />
                <div
                    className="border-l border-y-0 border-r-0 z-1 h-full border-l-white border-dashed absolute left-[50%]"
                />
            </div>
            <ul className="text-md gap-1 mt-2 flex flex-col" ref={partsRef}>
                {road.map(({ type, id }, index) => {
                    return (
                        <li key={id}>
                            {index + 1}. {type} [#{id.substring(id.length - 4)}]
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
