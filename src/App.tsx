import Lights from "@components/Lights"
import DepthTexturex from "@components/materials/DepthTexture"
import Path from "@components/path/Path"
import Player from "@components/player/Player"
import CloudSystem from "@components/world/CloudSystem"
import Foam from "@components/world/Foam"
import RockSystem from "@components/world/RockSystem"
import SpeedParticles from "@components/world/SpeedParticles"
import Water from "@components/world/Water"
import { CannonProvider } from "@data/cannon"
import Config from "@data/Config"
import { extend } from "@react-three/fiber"
import { lazy } from "react"

import Camera from "./components/Camera"
import extensions from "./extensions"

const Perf = lazy(async () => {
    let { Perf } = await import("r3f-perf")

    return { default: Perf }
})

extend(extensions)

export default function App() {
    return (
        <>
            <CannonProvider debug={Config.DEBUG}>
                <fogExp2 attach={"fog"} args={["white", .045]} />
                <color args={["white"]} attach={"background"} />

                <CloudSystem />
                <SpeedParticles />
                <Foam />
                <Water />
                <Camera />
                <Lights />

                <Path />
                <Player />
                <RockSystem />
                {/* at the very end */}
                <DepthTexturex />
            </CannonProvider>


            {Config.STATS && <Perf deepAnalyze antialias={false} />}
        </>
    )
} 
