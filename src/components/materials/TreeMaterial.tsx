import { aoMatrix } from "@data/ao"
import { useStore } from "@data/store/store"
import { useFrame } from "@react-three/fiber"
import { useEffect } from "react"
import { Matrix4 } from "three"

import { glsl } from "./helpers"
import { useShader } from "./useShader"

export default function TreeMaterial() {
    const aoTexture = useStore(i => i.aoTexture)
    const { uniforms, onBeforeCompile, customProgramCacheKey } = useShader({
        uniforms: {
            uAOTexture: { value: aoTexture },
            uAOMatrix: { value: new Matrix4() },
        },
        shared: glsl`
            uniform sampler2D uAOTexture;
            uniform mat4 uAOMatrix;
            varying vec3 vWorldPos;
            varying vec3 vWorldNormal;
        `,
        vertex: {
            main: glsl`
                #ifdef USE_INSTANCING
                    vec4 worldPos = modelMatrix * instanceMatrix * vec4(position, 1.0);
                    vec3 worldNormal = mat3(modelMatrix) * mat3(instanceMatrix) * normal;
                #else
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    vec3 worldNormal = mat3(modelMatrix) * normal;
                #endif

                vWorldPos = worldPos.xyz;
                vWorldNormal = normalize(worldNormal);
            `
        },
        fragment: {
            injectAt: "#include <color_fragment>",
            main: glsl`
                vec4 aoClip = uAOMatrix * vec4(vWorldPos, 1.0);
                vec2 aoUV = aoClip.xy / aoClip.w * 0.5 + 0.5;
                float aoSample = texture2D(uAOTexture, aoUV).r; 
                float aoStrength = 0.8;
                vec3 aoColor = mix(
                    diffuseColor.rgb,
                    vec3(0., 0., .1),
                    aoStrength
                );
                // only add shadow if not facing towards sky
                float facing = clamp(vWorldNormal.y, 0.0, 1.0);
                float ao = mix(aoSample, 1.0, facing);

                diffuseColor.rgb = mix(aoColor, diffuseColor.rgb, ao);
            `
        }
    })

    useEffect(() => {
        uniforms.uAOTexture.value = aoTexture
    }, [aoTexture])

    useFrame(() => {
        uniforms.uAOMatrix.value.copy(aoMatrix)
    })

    return (
        <meshLambertMaterial
            customProgramCacheKey={customProgramCacheKey}
            onBeforeCompile={onBeforeCompile}
            color={"#fff"}
            name="tree"
            dithering
        />
    )
}
