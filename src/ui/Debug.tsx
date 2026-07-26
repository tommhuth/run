import { ROAD_BASE_WIDTH, ROAD_FORWARD_EDGE } from "@components/road/const"
import { setDebugData } from "@data/store/actions/actions"
import { removeRoadPart } from "@data/store/actions/road"
import { removeTrafficElement } from "@data/store/actions/traffic"
import { RoadPart, store } from "@data/store/store"
import { extractRotation } from "@data/utils"
import { useRef } from "react"
import useAnimationFrame from "use-animation-frame"

export default function Debug() {
    const state = store(i => i.state)
    const { godMode, showColliders, aoEnabled, showAoDebug, physicsTime, bodies, nextPartOverride } = store(i => i.debug)
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
            const { vehicle, id } = traffic[i]

            if (!vehicle) {
                continue
            }

            const element = trafficRef.current.querySelector("#t" + id) as HTMLElement | null

            if (!element) {
                continue
            }

            const y = (vehicle.chassisBody.position.z - playerZ) * scale

            element.style.top = (-y * 100 + playerOrigin).toFixed(2) + "%"
            element.style.left = (50 + (-vehicle.chassisBody.position.x / ROAD_BASE_WIDTH) * 100).toFixed(2) + "%"
            element.style.rotate = extractRotation(vehicle.chassisBody.quaternion).y.toFixed(4) + "rad"
        }
    })

    return (
        <div className="text-shadow-[#fff7] text-shadow-xs absolute top-4 w-45 left-4 overflow-hidden flex flex-col gap-1 pointer-events-auto">
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
            <label className="relative z-1">
                <input
                    type="checkbox"
                    checked={aoEnabled}
                    onChange={e => setDebugData("aoEnabled", e.currentTarget.checked)}
                /> Fake AO
            </label>
            <label className="relative z-1">
                <input
                    type="checkbox"
                    checked={showAoDebug}
                    onChange={e => setDebugData("showAoDebug", e.currentTarget.checked)}
                /> Show AO texture
            </label>
            <div
                ref={trafficRef}
                className="mt-2 h-60 w-[50%] relative bg-[#000A] rounded-sm"
            >
                {traffic.map(({ direction, id, vehicle }) => {
                    if (!vehicle) {
                        return null
                    }

                    return (
                        <div
                            key={id}
                            id={"t" + id}
                            onClick={() => removeTrafficElement(id)}
                            title={"#" + id.substring(id.length - 4)}
                            className="border-black border cursor-pointer w-2 h-3 rounded-sm translate-[-50%] absolute z-1"
                            style={{ background: direction === 1 ? "yellow" : "orange" }}
                        />
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
            <select
                className="border-black p-1 border mt-2 rounded-sm"
                onChange={e => setDebugData("nextPartOverride", (e.currentTarget.value as RoadPart["type"]) || null)}
            >
                {["", "forest", "rocks", "bridge"].map(type => {
                    return (
                        <option value={type} key={type}>{type || "No override"}</option>
                    )
                })}
            </select>
            <ul className="text-md gap-2 mt-2 flex flex-col" ref={partsRef}>
                {road.map(({ type, id, position }, index) => {
                    return (
                        <li key={id} onClick={() => removeRoadPart(id)}>
                            {index + 1}. {type} [#{id.substring(id.length - 4)}] @{position[2]}
                        </li>
                    )
                })}
                {nextPartOverride && <li className="opacity-35">{road.length + 1}. {nextPartOverride}</li>}
            </ul>
        </div>
    )
}
