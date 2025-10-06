import CloudSystem from "@components/CloudSystem"
import DepthTexture from "@components/DepthTexture"
import Foam from "@components/Foam"
import Lights from "@components/Lights"
import Path from "@components/Path"
import Player from "@components/Player"
import RockSystem from "@components/RockSystem"
import SpeedParticles from "@components/SpeedParticles"
import Water from "@components/Water"
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
            <DepthTexture />

            {Config.STATS && <Perf deepAnalyze antialias={false} />}
        </>
    )
} 
