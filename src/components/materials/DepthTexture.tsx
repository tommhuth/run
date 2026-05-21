import { setState } from "@data/store/actions"
import { useFBO } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { Tuple2 } from "@src/types/global"
import { useEffect, useMemo } from "react"
import { DepthTexture as ThreeDepthTexture, NearestFilter, UnsignedShortType } from "three"

const size = 512

export default function DepthTexture() {
    const { viewport } = useThree()
    const [width, height] = useMemo<Tuple2>(() => [
        Math.ceil(size * viewport.dpr),
        Math.ceil(size * viewport.dpr * (1 / viewport.aspect))
    ], [viewport])
    const depthTexture = useMemo(() => {
        const dt = new ThreeDepthTexture(width, height)

        dt.type = UnsignedShortType
        dt.minFilter = NearestFilter
        dt.magFilter = NearestFilter

        return dt
    }, [width, height])
    const fbo = useFBO(width, height, {
        stencilBuffer: false,
        depthBuffer: true,
        depthTexture,
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

        gl.render(scene, camera)
    }, 1)

    useEffect(() => {
        setState({ depthTexture: fbo.depthTexture })
    }, [fbo.depthTexture])

    return null
}
