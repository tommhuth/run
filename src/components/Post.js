 
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
            blendFunction: BlendFunction.OVERLAY,
            samples: 30,
            rings: 7,
            distanceThreshold: .75, // * camera z distance
            distanceFalloff: 0.1,  // fade out?
            rangeThreshold: 0.05,  
            rangeFalloff: 0.01,
            luminanceInfluence: 0, // does lights affect the shadow 0 = no?
            radius: 20, // size of shadow itself
            resolutionScale: .75,
            scale: .75,
            bias: 0.05,
            fade: .1,
            intensity: 50, // strength of shadow
        }) 

        const effectPass = new EffectPass(
            camera,
            //smaaEffect,
            ssaoEffect 
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