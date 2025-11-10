import cloudMap from "@assets/textures/cloud.png"
import { store, useStore } from "@data/store"
import { useTexture } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
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
			varying vec3 vPosition;
			uniform vec3 playerPosition;   
			uniform sampler2D depthTexture; 

            ${easings}

            // thanks chattyman https://chatgpt.com/c/690d05ff-3a88-8325-b817-331a0a2e7eee
            // --- For sampling from depth buffer (nonlinear) ---
            float linearizeDepth(float depth, float near, float far) {
                // Convert depth buffer value [0,1] -> NDC [-1,1]
                float z = depth * 2.0 - 1.0;
                // Reconstruct view-space z
                float viewZ = (2.0 * near * far) / (far + near - z * (far - near));
                // Convert to linear 0–1 depth (near=0, far=1)
                return (viewZ - near) / (far - near);
            }

            // --- For world-space position ---
            float getLinearDepth(vec3 worldPos, mat4 viewMatrix, float near, float far) {
                // Transform world -> view
                vec4 viewPos = viewMatrix * vec4(worldPos, 1.0);
                float viewZ = -viewPos.z; // camera looks down -Z
                // Normalize to same 0–1 range
                return (viewZ - near) / (far - near);
            } 
        `,
        vertex: {
            main: glsl`  
                vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            `
        },
        fragment: {
            main: glsl` 
                vec2 uv = gl_FragCoord.xy / resolution.xy; 
                float sceneDepth = linearizeDepth(texture2D(depthTexture, uv).r, cameraNear, cameraFar);
                float fragmentDepth = getLinearDepth(vWorldPosition, viewMatrix, cameraNear, cameraFar);
  
                float extraDist = clamp(length(vWorldPosition - playerPosition) / 25., 0., 1.) * .075;
                float fadeDist = .025 + extraDist; // 150 depth
                float minDist = 0.;   
                float dist = sceneDepth - fragmentDepth;  
                float alpha = clamp((dist - minDist) / fadeDist, 0.0, 1.0);

                //gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0., 1., 1.), easeInOutQuad(clamp((vPosition.y) / 3., 0., 1.)));

                gl_FragColor.a *= easeInOutQuad(alpha);  
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
            color={"#1772db"}
            fog={true}
            dispose={null}
            dithering
        />
    )
}

export default forwardRef(CloudMaterial)
