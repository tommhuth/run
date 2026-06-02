import { setState } from "@data/store/actions/actions"
import { useFBO } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { Tuple2 } from "@src/types/global"
import { useEffect, useMemo } from "react"
import { DepthTexture, NearestFilter, UnsignedShortType } from "three"

const size = 512

export default function useRenderWithDepth() {
    const { viewport } = useThree()
    const [width, height] = useMemo<Tuple2>(() => [size, size], [viewport])
    const depthTexture = useMemo(() => {
        const dt = new DepthTexture(width, height)

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

        // render to depth buffer after hiding consuming meshes
        gl.setRenderTarget(fbo)
        gl.render(scene, camera)
        gl.setRenderTarget(null)

        scene.traverse(i => {
            if (i.userData?.ignoreDepthWrite) {
                i.visible = true
            }
        })

        // render scene normally
        gl.render(scene, camera)
    }, 1)

    useEffect(() => {
        setState({ depthTexture: fbo.depthTexture })
    }, [fbo.depthTexture])
}
