import { setState } from "@data/store"
import { useFBO } from "@react-three/drei"
import { useThree, useFrame } from "@react-three/fiber"
import { useEffect, useMemo } from "react"
import { Tuple2 } from "src/types/global"

let size = 512

export default function DepthTexturex() {
    let { viewport } = useThree()
    let [width, height] = useMemo<Tuple2>(() => [
        Math.ceil(size * viewport.dpr),
        Math.ceil(size * viewport.dpr * (1 / viewport.aspect))
    ], [viewport])
    let fbo = useFBO(width, height, {
        stencilBuffer: false,
        depthBuffer: true,
    })

    useFrame(({ gl, scene, camera }) => {
        scene.traverse(i => {
            if (i.userData?.ignoreDepthWrite) {
                i.visible = false
            }
        })

        gl.setRenderTarget(fbo)
        gl.render(scene, camera)
        gl.setRenderTarget(null)

        scene.traverse(i => {
            if (i.userData?.ignoreDepthWrite) {
                i.visible = true
            }
        })
    })

    useEffect(() => {
        setState({ depthTexture: fbo.depthTexture })
    }, [fbo.depthTexture])

    return null
}