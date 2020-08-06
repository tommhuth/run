 
import React, { Suspense, useMemo, useEffect } from 'react'
import { useLoader, useThree , useFrame} from 'react-three-fiber'
import {
    SMAAImageLoader,
    BlendFunction,
    DepthEffect,
    KernelSize,
    BloomEffect,
    EffectComposer,
    EffectPass,
    RenderPass,
    SMAAEffect,
    SSAOEffect,
    NormalPass
} from "postprocessing" 

// Fix smaa loader signature
const _load = SMAAImageLoader.prototype.load
SMAAImageLoader.prototype.load = function (_, set) {
    return _load.bind(this)(set)
}

function Post() {
    const { gl, scene, camera, size } = useThree()
    const smaa = useLoader(SMAAImageLoader)
    const composer = useMemo(() => {
        const composer = new EffectComposer(gl)
        const smaaEffect = new SMAAEffect(...smaa)

        composer.addPass(new RenderPass(scene, camera))

        smaaEffect.colorEdgesMaterial.setEdgeDetectionThreshold(0.1)

        const normalPass = new NormalPass(scene, camera)
        const ssaoEffect = new SSAOEffect(camera, normalPass.renderTarget.texture, {
            blendFunction: BlendFunction.MULTIPLY,
            samples: 30,
            rings: 4,
            distanceThreshold: 1.0, // Render distance depends on camera near&far.
            distanceFalloff: 0.0, // No need for falloff.
            rangeThreshold: 0.05, // Larger value works better for this camera frustum.
            rangeFalloff: 0.01,
            luminanceInfluence: 0.7,
            radius: 18.25,
            resolutionScale: .5,
            scale: 0.9,
            bias: 0.05
        })

        // SSAO is supposed to be a subtle effect!
        ssaoEffect.blendMode.opacity.value = 6.0 // Debug.

        const effectPass = new EffectPass(
            camera,
            smaaEffect,
            ssaoEffect,
            /*
            new BloomEffect({
                blendFunction: BlendFunction.ADD,
                kernelSize: KernelSize.VERY_LARGE,
                luminanceThreshold: 0.97,
                luminanceSmoothing: 0.075,
                height: 1600
            }),*/
            // new DepthEffect() // Check if depth looks ok.
        )
        
        effectPass.renderToScreen = true
        //normalPass.renderToScreen = true // Check if normals look ok.
        composer.addPass(normalPass)
        composer.addPass(effectPass)
 
        return composer
    }, [])

    useEffect(() => composer.setSize(size.width, size.height), [size])

    return useFrame((context, delta) => composer.render(delta), 1)
}

export default () => {
    return ( 
        <Suspense fallback={null}>
            <Post/>
        </Suspense>
    )
}