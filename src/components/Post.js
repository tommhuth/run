 
import React, { Suspense, useMemo, useEffect } from 'react'
import { useLoader, useThree , useFrame} from 'react-three-fiber'
import {
    SMAAImageLoader,
    BlendFunction, 
    PixelationEffect,
    EffectComposer,
    EffectPass,
    RenderPass,
    SMAAEffect,
    SSAOEffect,
    NormalPass
} from "postprocessing" 
import { Color } from 'three'

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
            rings: 7,
            distanceThreshold: .75,  
            distanceFalloff: 0.1,  
            rangeThreshold: 0.05,  
            rangeFalloff: 0.01,
            luminanceInfluence: 0 ,
            radius: 18.25, 
            resolutionScale: .75,
            scale: .75,
            bias: 0.05,
            fade: .1,
            intensity: 50, 
        }) 

        const effectPass = new EffectPass(
            camera,
            smaaEffect,
            ssaoEffect
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