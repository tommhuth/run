import { extend } from "@react-three/fiber"
import extensions from "./extensions"
import Camera from "./components/Camera"
import { CannonProvider } from "@data/cannon"
import Lights from "@components/Lights"
import Player from "@components/Player"
import Water from "@components/Water"
import Path from "@components/Path"

extend(extensions)

export default function App() {
    return (
        <>

            <fogExp2 attach={"fog"} args={["white", .04]} />
            <axesHelper visible={false} scale={5} position-y={.55} />

            <Lights />

            <color args={["white"]} attach={"background"} />

            <Water />

            <CannonProvider >
                <Path />
                <Player />
            </CannonProvider>
            <Camera />
        </>
    )
} 