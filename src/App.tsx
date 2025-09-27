import { extend } from "@react-three/fiber"
import extensions from "./extensions"
import Camera from "./components/Camera"
import { CannonProvider } from "@data/cannon"
import Lights from "@components/Lights"
import Player from "@components/Player"
import Water from "@components/Water"
import Path from "@components/Path"
import DepthTexture from "@components/DepthTexture"

extend(extensions)

export default function App() {
    return (
        <>
            <fogExp2 attach={"fog"} args={["white", .04]} />
            <color args={["white"]} attach={"background"} />

            <Water />
            <Camera />
            <Lights />

            <CannonProvider >
                <Path />
                <Player />
            </CannonProvider>

            {/* at the very end */}
            <DepthTexture />
        </>
    )
} 