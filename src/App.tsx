import Lights from "@components/Lights"
import DepthTexturex from "@components/materials/DepthTexture"
import Player from "@components/player/Player"
import Ground from "@components/road/Ground"
import Road, { FOG_DISTANCE, ROAD_FORWARD_EDGE } from "@components/road/Road"
import Traffic from "@components/vehicles/Traffic"
import { CannonProvider } from "@data/cannon"
import Config from "@data/Config"
import PlaceGrid from "@data/PlaceGrid"
import { useStore } from "@data/store"
import { extend } from "@react-three/fiber"
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
                <Road />
                <Traffic />
            </CannonProvider>

            {/* at the very end */}
            <DepthTexturex />

            {Config.STATS && <Perf deepAnalyze antialias={false} />}
        </>
    )
}
/*

                <Suv position={[-2, 4, 7]} rotation={[0, Math.PI * .6, 0]} />
                <SedanSports position={[-2, 4, 13]} rotation={[0, Math.PI * .6, 0]} />
                <Delivery position={[-2, 4, 16]} rotation={[0, Math.PI * .6, 0]} />
                <GarbageTruck position={[-2, 4, 2]} rotation={[0, Math.PI * .6, 0]} />
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