import { ndelta } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import easings from "@src/shaders/easings.glsl"

import { glsl } from "./helpers"
import { useShader } from "./useShader"

export default function DotMaterial() {
    const { uniforms, onBeforeCompile, customProgramCacheKey } = useShader({
        uniforms: {
            uTime: { value: 0 }
        },
        shared: glsl` 
            uniform float uTime;
            varying vec3 vPosition;
        `,
        vertex: {
            head: glsl``,
            main: glsl`
                vPosition = position;
            `
        },
        fragment: {
            head: glsl` 
                ${easings} 
            `,
            main: glsl`  
                float d = length(vec3(vPosition.x, 0., vPosition.z));        // distance from 0,0,0 
                 // normalize 0–1
                float w1 = sin(d * 3.0  - uTime );
                float w2 = sin(d * 6.0 - uTime + 1.);
                float w3 = sin(d * 12.0 - uTime + 2.);

                float wave = w1 * w2 * w3;
                wave = wave * 0.5 + 0.5;     

                // optional shaping
                wave = easeInOutQuad(wave) * (1. - d / .5);

                gl_FragColor.a = wave; 
            `
        }
    })

    useFrame((state, delta) => {
        uniforms.uTime.value += ndelta(delta * 2)
    })

    return (
        <meshBasicMaterial
            transparent
            customProgramCacheKey={customProgramCacheKey}
            onBeforeCompile={onBeforeCompile}
            color="#ffaa00"
            toneMapped={false}
            name="dot"
        />
    )
}
