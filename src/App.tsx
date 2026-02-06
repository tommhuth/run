import Lights from "@components/Lights"
import DepthTexturex from "@components/materials/DepthTexture"
import Player from "@components/player/Player"
import Road, { Floor, FOG_DISTANCE, ROAD_FORWARD_EDGE } from "@components/road/Road"
import Sky from "@components/road/Sky"
import Traffic from "@components/vehicles/Traffic"
import Truck from "@components/vehicles/Truck"
import { CannonProvider } from "@data/cannon"
import Config from "@data/Config"
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
                <Floor />
                <Traffic />
                <Road />

                <Player />
                <Sky />

                {/*<Truck rotation={[0, Math.PI * .5, 0]} position={[0, 2, 3]} />*/}
            </CannonProvider>

            <axesHelper
                visible={false}
                scale={10}
                position={[0, 2, -0]}
            />

            {/* at the very end */}
            <DepthTexturex />

            {Config.STATS && <Perf deepAnalyze antialias={false} />}
        </>
    )
} 
