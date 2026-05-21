import { Instances } from "@components/Instances"
import Lights from "@components/Lights"
import DepthTexture from "@components/materials/DepthTexture"
import MaterialLoader from "@components/materials/MaterialLoader"
import CloudSystem from "@components/road/CloudSystem"
import { FOG_DISTANCE, ROAD_FORWARD_EDGE } from "@components/road/const"
import GrassSystem from "@components/road/GrassSystem"
import Ground from "@components/road/Ground"
import Player from "@components/road/player/Player"
import Road from "@components/road/Road"
import Traffic from "@components/road/traffic/Traffic"
import { CannonProvider } from "@data/cannon"
import Config from "@data/Config"
import PlaceGrid from "@data/PlaceGrid"
import { useStore } from "@data/store"
import { setSharedObject } from "@data/store/actions"
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
    const { showColliders } = useStore(i => i.debug)
    const loading = useStore(i => i.loading)

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

                <Ground />
                <Traffic />
                <Road />
                <Instances />
            </CannonProvider>

            <MaterialLoader />
            {/* at the very end */}
            <DepthTexture />

            {Config.STATS && <Perf deepAnalyze antialias={false} />}
        </>
    )
}

export function GridDebug({ g, scale = .95 }: { g: PlaceGrid; scale?: number }) {
    return (
        <>
            <mesh position={g.origin}>
                <sphereGeometry args={[.5]} />
                <meshLambertMaterial color={"yellow"} />
            </mesh>

            <group>
                {[...g].map(([key, cell]) => {
                    return (
                        <mesh key={key} position={cell.position}>
                            <boxGeometry args={[g.cellSize * scale, .1, g.cellSize * scale]} />
                            <meshLambertMaterial color={cell.occupied ? "red" : "green"} />
                        </mesh>
                    )
                })}
            </group>
        </>
    )
}
