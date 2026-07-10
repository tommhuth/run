import { AO_TEXTURE_HEIGHT, AO_TEXTURE_WIDTH, renderAO } from "@data/ao"
import { DEPTH_IGNORE_LAYER } from "@data/depth"
import { setState } from "@data/store/actions/actions"
import { store } from "@data/store/store"
import { useFBO } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { Tuple2 } from "@src/types/global"
import { useEffect, useMemo } from "react"
import { DepthTexture, LinearFilter, NearestFilter, UnsignedShortType } from "three"



// renders ao, then custom depth text, then final pass
export default function useRenderer() {
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
    const ao = useFBO(AO_TEXTURE_WIDTH, AO_TEXTURE_HEIGHT, {
        stencilBuffer: false,
        depthBuffer: true,
    })
    const shadowBlurHorizontal = useFBO(AO_TEXTURE_WIDTH, AO_TEXTURE_HEIGHT, {
        stencilBuffer: false,
        depthBuffer: false,
        minFilter: LinearFilter,
        magFilter: LinearFilter,
    })
    const shadowBlur = useFBO(AO_TEXTURE_WIDTH, AO_TEXTURE_HEIGHT, {
        stencilBuffer: false,
        depthBuffer: false,
        minFilter: LinearFilter,
        magFilter: LinearFilter,
    })

    useFrame(({ gl, scene, camera }) => {
        if (store.getState().debug.aoEnabled) {
            // render ao texture
            renderAO({
                gl,
                scene,
                camera,
                shadowBlur,
                shadowBlurHorizontal,
                ao
            })
        }

        // render to depth buffer, excluding depth-ignored objects 
        camera.layers.enableAll()
        camera.layers.disable(DEPTH_IGNORE_LAYER)
        gl.setRenderTarget(fbo)
        gl.render(scene, camera)

        // normal pass
        camera.layers.enableAll()
        gl.setRenderTarget(null)
        gl.render(scene, camera)
    }, 1)

    useEffect(() => {
        setState({
            depthTexture: fbo.depthTexture,
            aoTexture: shadowBlur.texture
        })
    }, [fbo.depthTexture])
}
