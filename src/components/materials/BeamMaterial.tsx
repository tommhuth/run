import easings from "@src/shaders/easings.glsl"

import { glsl } from "./helpers"
import { useShader } from "./useShader"

export default function BeamMaterial() {
    const { onBeforeCompile } = useShader({
        uniforms: {
            uTime: { value: 0 }
        },
        shared: glsl`
        
                uniform float uTime;
                varying vec3 vPosition;
        `,
        vertex: {
            head: glsl` 
            `,
            main: glsl`
                vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            `
        },
        fragment: {
            head: glsl` 
            ${easings}

            float opacityFromY(float y) {  
                float heightBottom = 2.;
                float heightTop = 13.;
                float x1 = clamp(y / heightBottom, 0., 1.);
                float x2 = 1. -clamp((y - heightBottom) / heightTop, 0., 1.);

                return easeOutQuad(x1) *  (x2);
            }
            `,
            main: glsl`  
                gl_FragColor.a *= opacityFromY(vPosition.y);
            `
        }
    })

    return (
        <meshBasicMaterial
            transparent
            onBeforeCompile={onBeforeCompile}
            color={"#ffdd53"}
            toneMapped={false}
            opacity={.45}
        />
    )
}
