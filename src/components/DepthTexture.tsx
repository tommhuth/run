import { setState } from "@data/store"
import { useFBO } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { Tuple2 } from "@src/types/global"
import { useEffect, useMemo } from "react"

const size = 512

export default function DepthTexturex() {
    const { viewport } = useThree()
    const [width, height] = useMemo<Tuple2>(() => [
        Math.ceil(size * viewport.dpr),
        Math.ceil(size * viewport.dpr * (1 / viewport.aspect))
    ], [viewport])
    const fbo = useFBO(width, height, {
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
