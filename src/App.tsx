import Lights from "@components/Lights"
import DepthTexturex from "@components/materials/DepthTexture"
import Player from "@components/player/Player"
import Road, { Floor } from "@components/road/Road"
import Traffic from "@components/vehicles/Traffic"
import { CannonProvider } from "@data/cannon"
import Config from "@data/Config"
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
    return (
        <>
            <fogExp2
                args={["#fff"]}
                attach={"fog"}
                density={.021}
            />
            <color args={["#fff"]} attach={"background"} />
            <CannonProvider debug={Config.DEBUG}>
                <Camera />
                <Lights />
                <Floor />
                <Traffic />
                <Road />

                <Player position={[-1.25, 1, 0]} />
            </CannonProvider>

            <axesHelper
                visible={false}
                scale={10}
                position={[0, 2, -0]}
            />

            {/* at the very end */}
            <S />
            {Config.STATS && <Perf deepAnalyze antialias={false} />}
        </>
    )
}


function S() {
    return <DepthTexturex />
}