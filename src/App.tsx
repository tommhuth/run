import Lights from "@components/Lights"
import Player from "@components/player/Player"
import { CannonProvider } from "@data/cannon"
import Config from "@data/Config"
import { extend } from "@react-three/fiber"
import { lazy } from "react"

import Camera from "./components/Camera"
import extensions from "./extensions"
import Road, { Floor } from "@components/road/Road"
import Traffic from "@components/road/Traffic"

const Perf = lazy(async () => {
    let { Perf } = await import("r3f-perf")

    return { default: Perf }
})

extend(extensions)


export default function App() {
    return (
        <>
            <fogExp2
                args={["black"]}
                attach={"fog"}
                density={.015}
            />
            <CannonProvider debug={Config.DEBUG}>
                <Camera />
                <Lights />
                <Floor />
                <Traffic />
                <Road />

                <Player position={[-1.25, 1, 0]} />
            </CannonProvider>

            <axesHelper scale={10} position={[0, 2, -0]} />

            {Config.STATS && <Perf deepAnalyze antialias={false} />}
        </>
    )
} 
