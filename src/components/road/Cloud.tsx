import cloudImage from "@assets/textures/11.png"
import { glsl } from "@components/materials/helpers"
import { useShader } from "@components/materials/useShader"
import { store, useStore } from "@data/store"
import { ndelta } from "@data/utils"
import { useTexture } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { memo, useEffect, useLayoutEffect, useRef } from "react"
import { BufferGeometry, Euler, Material, Mesh, PlaneGeometry, Quaternion, Vector2, Vector3 } from "three"
import { damp } from "three/src/math/MathUtils.js"

const geometry = new PlaneGeometry(12, 5, 1, 1)

geometry.rotateY(Math.PI * 1)

export interface CloudProps {
    damping: number
    speed: number
    position: Tuple3
    scale?: number
    id: string
}

function Cloud({
    speed,
    position,
    damping,
    scale,
}: CloudProps) {
    const map = useTexture(cloudImage)
    const ref = useRef<Mesh<BufferGeometry, Material>>(null)
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
            cameraMatrixWorld: {
                value: camera.matrixWorld
            },
            projectionMatrixInverse: {
                value: camera.projectionMatrixInverse
            },
            depthTexture: {
                value: depthTexture,
            }
        },
        shared: glsl` 
			uniform float cameraNear;
			uniform float cameraFar;
			uniform vec2 resolution;
			varying vec3 worldPos;
			uniform vec3 playerPosition;
			uniform mat4 cameraMatrixWorld;
			uniform mat4 projectionMatrixInverse;
			uniform sampler2D depthTexture; 

            // reconstruct linear view-space Z from depth texture
            float getWorldZ(vec2 uv) {
                float depth = texture2D(depthTexture, uv).r;

                // depth -> NDC z [-1..1]
                float z = depth * 2.0 - 1.0;
                vec4 clip = vec4(uv * 2.0 - 1.0, z, 1.0);

                // NDC -> view space
                vec4 view = projectionMatrixInverse * clip;
                view /= view.w;

                // view -> world space
                vec4 world = cameraMatrixWorld * view;

                return world.z;
            }

            float easeOutQuad(float x) {
                return 1. - (1. - x) * (1. - x);
            }

            float fadein(float depthWorld, float z, float minDist, float fadeDist ) {
                float dist =   (depthWorld - worldPos.z); // positive if pixel is in front
                float alpha = clamp((dist - minDist) / fadeDist, 0.0, 1.0);

                return alpha;
            }
  
            float smoothAlpha(vec2 uv, float baseAlpha, float radius) {
                float texel = 1.0 / resolution.x;

                // Gaussian weights for ±2
                float w0 = 0.227027;
                float w1 = 0.316216;
                float w2 = 0.070270;

                // horizontal blur
                float hSum = baseAlpha * w0;
                hSum += fadein(getWorldZ(uv + vec2( 1.0, 0.0) * texel * radius), worldPos.z, 0.5, 0.75) * w1;
                hSum += fadein(getWorldZ(uv - vec2( 1.0, 0.0) * texel * radius), worldPos.z, 0.5, 0.75) * w1;
                hSum += fadein(getWorldZ(uv + vec2( 2.0, 0.0) * texel * radius), worldPos.z, 0.5, 0.75) * w2;
                hSum += fadein(getWorldZ(uv - vec2( 2.0, 0.0) * texel * radius), worldPos.z, 0.5, 0.75) * w2;

                // vertical blur
                float vSum = hSum * w0;
                vSum += fadein(getWorldZ(uv + vec2(0.0,  1.0) * texel * radius), worldPos.z, 0.5, 0.75) * w1;
                vSum += fadein(getWorldZ(uv - vec2(0.0,  1.0) * texel * radius), worldPos.z, 0.5, 0.75) * w1;
                vSum += fadein(getWorldZ(uv + vec2(0.0,  2.0) * texel * radius), worldPos.z, 0.5, 0.75) * w2;
                vSum += fadein(getWorldZ(uv - vec2(0.0,  2.0) * texel * radius), worldPos.z, 0.5, 0.75) * w2;

                return baseAlpha;
            }
 
        `,
        vertex: {
            main: glsl`  
                worldPos =  (modelMatrix * vec4(position, 1.0)).xyz;
            `
        },
        fragment: {
            main: glsl` 
                vec2 uv = gl_FragCoord.xy / resolution.xy;
                float depthWorld = getWorldZ(uv);  
  
                float fadeDist = 4.;
                float minDist = 1.; 
                
                float dist = (depthWorld - worldPos.z) - minDist;
 
                gl_FragColor.a *= (fadein(depthWorld, worldPos.z, minDist, fadeDist)) * 1.;  
                gl_FragColor.a *= clamp((worldPos.z - playerPosition.z - 1.) / 3. , 0., 1.);  

                gl_FragColor.a *= smoothAlpha(uv, gl_FragColor.a, 16.); 
 
            `
        }
    })

    useEffect(() => {
        uniforms.depthTexture.value = depthTexture
        uniforms.resolution.value.set(size.width, size.height)
            .multiplyScalar(viewport.dpr)
    }, [size, depthTexture])

    useLayoutEffect(() => {
        if (!ref.current) {
            return
        }

        ref.current.material.opacity = 0
    }, [position])

    useFrame(() => {
        const { player: { vehicle } } = store.getState()

        if (vehicle) {
            uniforms.playerPosition.value.copy(vehicle.chassisBody.position)
        }
    })

    useFrame((state, delta) => {
        let { player: { vehicle } } = store.getState()

        if (!ref.current || !vehicle) {
            return
        }

        let e = new Euler().setFromQuaternion(new Quaternion().copy(vehicle.chassisBody.quaternion))

        ref.current.material.opacity = damp(ref.current.material.opacity, 1, damping, ndelta(delta))
        ref.current.position.x -= ndelta(delta) * speed
        ref.current.rotation.y = e.y
    })

    return (
        <mesh
            position={position}
            geometry={geometry}
            ref={ref}
            userData={{ ignoreDepthWrite: true }}
            rotation-x={.2}
            scale={scale}
        >
            <meshLambertMaterial
                onBeforeCompile={onBeforeCompile}
                transparent
                map={map}
                name="cloud"
                color="#fff"
                fog={false}
                depthWrite={false}
                dispose={null}
            />
        </mesh>
    )
}

export default memo(Cloud)
