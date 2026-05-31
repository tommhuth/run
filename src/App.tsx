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
import useRenderWithDepth from "@data/hooks/useRenderWithDepth"
import { setSharedObject, setState } from "@data/store/actions/actions"
import { useStore } from "@data/store/store"
import { AdaptiveDpr } from "@react-three/drei"
import { extend } from "@react-three/fiber"
import { lazy, useEffect } from "react"

import Camera from "./components/Camera"
import extensions from "./extensions"

const Perf = lazy(async () => {
    const { Perf } = await import("r3f-perf")

    return { default: Perf }
})

extend(extensions)

export default function App() {
    const showColliders = useStore(i => i.debug.showColliders)
    const loading = useStore(i => i.loading)

    useRenderWithDepth()
    useFramerateReady(() => {
        setState({ loading: false })
    })

    useEffect(() => {
        const canvas = document.getElementById("canvas")

        if (!loading && canvas) {
            canvas.style.opacity = "1"
        }
    }, [loading])

    return (
        <>
            <AdaptiveDpr pixelated />
            <fog
                args={["#fff"]}
                attach={"fog"}
                far={ROAD_FORWARD_EDGE}
                near={ROAD_FORWARD_EDGE - FOG_DISTANCE}
            />
            <color args={["#fff"]} attach={"background"} />
            <Target />

            <pointLight
                name="pointLight"
                ref={setSharedObject}
            />

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
