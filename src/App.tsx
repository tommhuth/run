import { Instances } from "@components/Instances"
import Lights from "@components/Lights"
import MaterialLoader from "@components/materials/MaterialLoader"
import CloudSystem from "@components/road/CloudSystem"
import { FOG_DISTANCE, ROAD_FORWARD_EDGE } from "@components/road/const"
import GrassSystem from "@components/road/GrassSystem"
import Ground from "@components/road/Ground"
import LeafSystem from "@components/road/LeafSystem"
import Player from "@components/road/player/Player"
import Road from "@components/road/Road"
import Target from "@components/road/Target"
import Traffic from "@components/road/traffic/Traffic"
import { CannonProvider } from "@data/cannon"
import Config from "@data/Config"
import useFramerateReady from "@data/hooks/useFramerateReady"
import { getStats, useRenderStats } from "@data/hooks/useRenderStats"
import useRenderWithDepth from "@data/hooks/useRenderWithDepth"
import { setState } from "@data/store/actions/actions"
import { useStore } from "@data/store/store"
import { extend, useThree } from "@react-three/fiber"
import { init as sentryInit, metrics } from "@sentry/browser"
import { lazy, useEffect } from "react"

import Camera from "./components/Camera"
import extensions from "./extensions"

const Perf = lazy(async () => {
    const { Perf } = await import("r3f-perf")

    return { default: Perf }
})

extend(extensions)

sentryInit({
    dsn: "https://8a94a1dec7dd48028c5ebc676270e411@o501978.ingest.us.sentry.io/5583797",
    environment: "production",
    enabled: true,
})

const start = Date.now()

export default function App() {
    const showColliders = useStore(i => i.debug.showColliders)
    const loading = useStore(i => i.loading)
    const { gl, viewport } = useThree()

    useRenderStats()
    useRenderWithDepth()
    useFramerateReady(() => {
        setState({ loading: false })
        metrics.gauge("load_time", (Date.now() - start) / 1000, {
            unit: "second",
            attributes: getStats(gl, viewport)
        })
    })

    useEffect(() => {
        const start = () => {
            setState({ state: "running" })
        }

        window.addEventListener("pointerdown", start)
        window.addEventListener("keydown", start)

        return () => {
            window.removeEventListener("pointerdown", start)
            window.removeEventListener("keydown", start)
        }
    }, [])

    useEffect(() => {
        const canvas = document.getElementById("canvas")

        if (!loading && canvas) {
            canvas.style.opacity = "1"
        }
    }, [loading])

    return (
        <>
            <fog
                args={["#fff"]}
                attach={"fog"}
                far={ROAD_FORWARD_EDGE}
                near={ROAD_FORWARD_EDGE - FOG_DISTANCE}
            />
            <color args={["#fff"]} attach={"background"} />
            <Target />

            <CannonProvider debug={showColliders}>
                <Camera />
                <Lights />
                <Player />
                <GrassSystem />
                <CloudSystem />
                <LeafSystem />

                <Ground />
                <Traffic />
                <Road />
                <Instances />
            </CannonProvider>

            <MaterialLoader />

            {Config.STATS && <Perf deepAnalyze antialias={false} />}
        </>
    )
}
