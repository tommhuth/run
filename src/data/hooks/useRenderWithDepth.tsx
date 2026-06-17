import { setState } from "@data/store/actions/actions"
import { useStore } from "@data/store/store"
import { useFBO } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { Tuple2 } from "@src/types/global"
import { useEffect, useMemo } from "react"
import { DepthTexture, Layers, NearestFilter, UnsignedShortType } from "three"

// Objects on this layer only are rendered in the normal pass but excluded
// from the depth prepass, replacing per-frame scene traversal.
export const DEPTH_IGNORE_LAYER = 1

export const depthIgnoreLayers = new Layers()

depthIgnoreLayers.set(DEPTH_IGNORE_LAYER)

export default function useRenderWithDepth() {
    const { viewport } = useThree()
    const [width, height] = useMemo<Tuple2>(() => [
        Math.ceil(window.innerWidth * viewport.dpr * .5),
        Math.ceil(window.innerHeight * viewport.dpr * .5),
    ], [viewport])
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
        // exclude depth-ignored objects (they live only on DEPTH_IGNORE_LAYER)
        camera.layers.disable(DEPTH_IGNORE_LAYER)

        // render to depth buffer
        gl.setRenderTarget(fbo)
        gl.render(scene, camera)
        gl.setRenderTarget(null)

        // re-include them for the normal pass
        camera.layers.enable(DEPTH_IGNORE_LAYER)

        // render scene normally
        gl.render(scene, camera)
    }, 1)

    useEffect(() => {
        setState({ depthTexture: fbo.depthTexture })
    }, [fbo.depthTexture])
}
