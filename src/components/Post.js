
import React, { Suspense, useMemo, useEffect } from "react"
import { useLoader, useThree, useFrame } from "react-three-fiber"
import {
    SMAAImageLoader, 
    EffectComposer,
    EffectPass,
    RenderPass,
    SMAAEffect, 
    NormalPass, 
} from "postprocessing" 

// Fix smaa loader signature
let _load = SMAAImageLoader.prototype.load

SMAAImageLoader.prototype.load = function (_, set) {
    return _load.bind(this)(set)
}

function Post1() {
    let { gl, scene, camera, size } = useThree()
    let smaa = useLoader(SMAAImageLoader)
    let composer = useMemo(() => {
        let composer = new EffectComposer(gl)
        let smaaEffect = new SMAAEffect(...smaa) 

        composer.addPass(new RenderPass(scene, camera)) 
        smaaEffect.colorEdgesMaterial.setEdgeDetectionThreshold(0.1) 

        let normalPass = new NormalPass(scene, camera) 
        let effectPass = new EffectPass(
            camera, 
            smaaEffect
        )

        effectPass.renderToScreen = true
        composer.addPass(normalPass)
        composer.addPass(effectPass)

        return composer
    }, [])

    useEffect(() => composer.setSize(size.width, size.height), [size])

    return useFrame((context, delta) => composer.render(delta), 1)
}
 
function FullPost() {
    return (
        <Suspense fallback={null}>
            <Post1 />
        </Suspense>
    )
}
 

export { FullPost }