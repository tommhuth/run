import Lights from "@components/Lights"
import DepthTexture from "@components/materials/DepthTexture"
import CloudSystem from "@components/road/CloudSystem"
import { FOG_DISTANCE, ROAD_FORWARD_EDGE } from "@components/road/const"
import Ground from "@components/road/Ground"
import Player from "@components/road/player/Player"
import Road from "@components/road/Road"
import Traffic from "@components/road/traffic/Traffic"
import { CannonProvider } from "@data/cannon"
import Config from "@data/Config"
import PlaceGrid from "@data/PlaceGrid"
import { useStore } from "@data/store"
import { extend, useFrame } from "@react-three/fiber"
import { lazy } from "react"

import Camera from "./components/Camera"
import extensions from "./extensions"

const Perf = lazy(async () => {
    const { Perf } = await import("r3f-perf")

    return { default: Perf }
})

extend(extensions)

export default function App() {
    const { showColliders } = useStore(i => i.debug)

    useFrame(({ gl, scene, camera }) => {
        gl.render(scene, camera)
    })

    return (
        <>
            <fog
                args={["#fff"]}
                attach={"fog"}
                far={ROAD_FORWARD_EDGE}
                near={ROAD_FORWARD_EDGE - FOG_DISTANCE}
            />
            <color args={["#fff"]} attach={"background"} />

            <CannonProvider debug={showColliders}>
                <Camera />
                <Lights />
                <Player />

                <Ground />
                <Traffic />
                <Road />
                <CloudSystem />
            </CannonProvider>

            {/* at the very end */}
            <DepthTexture />

            {Config.STATS && <Perf deepAnalyze antialias={false} />}
        </>
    )
}

/*
    <Suv position={[-2, 4, 7]} rotation={[0, Math.PI * .6, 0]} /> 
*/

export function GridDebug({ g, scale = .95 }: { g: PlaceGrid; scale: number }) {
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
