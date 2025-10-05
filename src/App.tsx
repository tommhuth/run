import { extend } from "@react-three/fiber"
import extensions from "./extensions"
import Camera from "./components/Camera"
import { CannonProvider } from "@data/cannon"
import Lights from "@components/Lights"
import Player from "@components/Player"
import Water from "@components/Water"
import Path from "@components/Path"
import DepthTexture from "@components/DepthTexture"
import { Perf } from "r3f-perf"
import CloudSystem from "@components/CloudSystem"
import Config from "@data/Config"
import SpeedParticles from "@components/SpeedParticles"
import RockSystem from "@components/RockSystem"
import Foam from "@components/Foam"

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