import { ROAD_FORWARD_EDGE } from "@components/road/const"
import { aoMatrix } from "@data/ao"
import { store, useStore } from "@data/store/store"
import { useFrame } from "@react-three/fiber"
import { useEffect } from "react"
import { Matrix4, Vector3 } from "three"

import { glsl } from "./helpers"
import { useShader } from "./useShader"

export default function TreeMaterial() {
    const aoTexture = useStore(i => i.aoTexture)
    const aoEnabled = useStore(i => i.debug.aoEnabled)
    const { uniforms, onBeforeCompile, customProgramCacheKey } = useShader({
        uniforms: {
            uAOTexture: { value: aoTexture },
            uAOMatrix: { value: new Matrix4() },
            uAOEnabled: { value: aoEnabled ? 1 : 0 },
            uFadeEdge: { value: ROAD_FORWARD_EDGE },
            uPlayerPosition: { value: new Vector3() },
        },
        shared: glsl`
            uniform sampler2D uAOTexture;
            uniform mat4 uAOMatrix;
            uniform float uAOEnabled;
            uniform float uFadeEdge;
            uniform vec3 uPlayerPosition;
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
                vec4 aoSample = texture2D(uAOTexture, aoUV); 
                float aoStrength = 0.8;
                vec3 aoColor = mix(
                    diffuseColor.rgb,
                    vec3(0., 0., .1),
                    aoStrength
                );
                // only add shadow if not facing towards sky
                float facing = clamp(vWorldNormal.y, 0.0, 1.0);
                float below = smoothstep(aoSample.g * 15. * .85, aoSample.g * 15., vWorldPos.y);
                float ao = mix(aoSample.r, 1.0, min(facing, below));  
                              
                ao = mix(1.0, ao, uAOEnabled);

                diffuseColor.rgb = mix(aoColor, diffuseColor.rgb, ao);
                diffuseColor.a = smoothstep(75., 70., vWorldPos.z - uPlayerPosition.z);
            `
        }
    })

    useEffect(() => {
        uniforms.uAOTexture.value = aoTexture
    }, [aoTexture])

    useEffect(() => {
        uniforms.uAOEnabled.value = aoEnabled ? 1 : 0
    }, [aoEnabled])

    useFrame(() => {
        uniforms.uAOMatrix.value.copy(aoMatrix)

        const { player } = store.getState()

        if (player.vehicle) {
            uniforms.uPlayerPosition.value.copy(player.vehicle.chassisBody.position)
        }
    })

    return (
        <meshLambertMaterial
            customProgramCacheKey={customProgramCacheKey}
            onBeforeCompile={onBeforeCompile}
            color={"#fff"}
            name="tree"
            transparent
            dithering
        />
    )
}
