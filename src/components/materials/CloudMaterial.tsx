import cloudMap from "@assets/textures/cloud.png"
import { store, useStore } from "@data/store/store"
import { useTexture } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import depth from "@src/shaders/depth.glsl"
import easings from "@src/shaders/easings.glsl"
import { ForwardedRef, forwardRef, useEffect } from "react"
import { MeshBasicMaterial, Vector2, Vector3 } from "three"

import { glsl } from "./helpers"
import { useShader } from "./useShader"

function CloudMaterial(props, ref: ForwardedRef<MeshBasicMaterial>) {
    const map = useTexture(cloudMap)
    const { camera, viewport, size } = useThree()
    const depthTexture = useStore(i => i.depthTexture)
    const { onBeforeCompile, uniforms } = useShader({
        uniforms: {
            cameraNear: {
                value: camera.near,
            },
            cameraFar: {
                value: camera.far,
            },
            resolution: {
                value: new Vector2(),
            },
            playerPosition: {
                value: new Vector3()
            },
            depthTexture: {
                value: depthTexture,
            }
        },
        shared: glsl` 
			uniform float cameraNear;
			uniform float cameraFar;
			uniform vec2 resolution;
			varying vec3 vWorldPosition; 
			uniform vec3 playerPosition;   
			uniform sampler2D depthTexture; 

            ${easings}
            ${depth}
        `,
        vertex: {
            main: glsl`  
                vWorldPosition = (instanceMatrix * vec4(position, 1.0)).xyz; 
            `
        },
        fragment: {
            main: glsl` 
                float dist = getFragmentDepth(vWorldPosition, depthTexture, gl_FragCoord.xy / resolution, viewMatrix, cameraNear, cameraFar);
  
                float extraDist = clamp(length(vWorldPosition - playerPosition) / 25., 0., 1.) * .075;
                float fadeDist = .025 + extraDist; 
                float minDist = 0.;   
                float alpha = clamp((dist - minDist) / fadeDist, 0.0, 1.0);

                float fadeEdge = 25.;
                float fadeEdgeDistance = 5.;
                float fadeIn  = smoothstep(-fadeEdge, -(fadeEdge - fadeEdgeDistance), vWorldPosition.x);
                float fadeOut = 1.0 - smoothstep(fadeEdge - fadeEdgeDistance, fadeEdge, vWorldPosition.x);
 
                gl_FragColor.rgb = vec3(1.);
                gl_FragColor.a *= easeInOutQuad(alpha) * .9 * fadeIn * fadeOut;  
            `
        }
    })

    useEffect(() => {
        uniforms.depthTexture.value = depthTexture
        uniforms.resolution.value.set(size.width, size.height)
            .multiplyScalar(viewport.dpr)
    }, [size, depthTexture])

    useFrame(() => {
        const { player: { vehicle } } = store.getState()

        if (vehicle) {
            uniforms.playerPosition.value.copy(vehicle.chassisBody.position)
        }
    })

    return (
        <meshBasicMaterial
            onBeforeCompile={onBeforeCompile}
            transparent
            map={map}
            ref={ref}
            name="cloud"
            fog={true}
            dispose={null}
            dithering
            depthWrite={false}
        />
    )
}

export default forwardRef(CloudMaterial)
