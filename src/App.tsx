
import DepthTexturex from "@components/DepthTexture"
import Lights from "@components/Lights"
import Path from "@components/path/Path"
import Player from "@components/Player"
import CloudSystem from "@components/world/CloudSystem"
import Foam from "@components/world/Foam"
import RockSystem from "@components/world/RockSystem"
import SpeedParticles from "@components/world/SpeedParticles"
import Water from "@components/world/Water"
import { CannonProvider } from "@data/cannon"
import Config from "@data/Config"
import { extend } from "@react-three/fiber"
import { Perf } from "r3f-perf"

import Camera from "./components/Camera"
import extensions from "./extensions"

extend(extensions)

export default function App() {
    return (
        <>
            <fogExp2 attach={"fog"} args={["white", .045]} />
            <color args={["white"]} attach={"background"} />

            <CloudSystem />
            <SpeedParticles />
            <Foam />
            <Water />
            <Camera />
            <Lights />

            <CannonProvider debug={Config.DEBUG}>
                <Path />
                <Player />
                <RockSystem />
            </CannonProvider>

            {/* at the very end */}
            <DepthTexturex />

            {Config.STATS && <Perf deepAnalyze antialias={false} />}
        </>
    )
} 
