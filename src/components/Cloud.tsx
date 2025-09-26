
import cloud from "@assets/textures/11.png"
import { useShader } from "@data/hooks"
import { store } from "@data/store"
import { glsl } from "@data/utils"
import random from "@huth/random"
import { useTexture } from "@react-three/drei"
import { useThree, useFrame } from "@react-three/fiber"
import { useRef, useMemo, useLayoutEffect } from "react"
import { Mesh, Vector2, Vector3, MeshBasicMaterial, PlaneGeometry } from "three"
import { damp } from "three/src/math/MathUtils.js"



let g = new PlaneGeometry(12, 5, 1, 1)

g.rotateY(Math.PI * 1)

export default function Cloud(props) {
    let text = useTexture(cloud)
    let ref = useRef<Mesh>(null)
    let { camera, gl } = useThree()
    let { onBeforeCompile, uniforms } = useShader({
        uniforms: {
            cameraNear: {
                value: camera.near,
            },
            cameraFar: {
                value: camera.far,
            },
            resolution: {
                value: gl.getSize(new Vector2()).multiplyScalar(gl.getPixelRatio()),
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
            tDepth: {
                value: props.depthTexture,
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
			uniform sampler2D tDepth; 

            // reconstruct linear view-space Z from depth texture
            float getWorldZ(vec2 uv) {
                float depth = texture2D(tDepth, uv).r;

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
  
                float fadeDist = 2.;
                float minDist = 1.; 
                
                float dist = (depthWorld - worldPos.z) - minDist;
 
                gl_FragColor.a *= (fadein(depthWorld, worldPos.z, minDist, fadeDist)) * 1.;  
                gl_FragColor.a *= clamp((worldPos.z - playerPosition.z - 1.) / 6. , 0., 1.);  

                gl_FragColor.a *= smoothAlpha(uv, gl_FragColor.a, 6.); 
 
            `
        }
    })


    let speed = useMemo(() => random.pick(.1, .25), [])
    let mat = useRef<MeshBasicMaterial>(null)

    useLayoutEffect(() => {
        mat.current.opacity = 0
    }, [])

    useFrame(({ gl, scene, camera, clock }, delta) => {
        uniforms.tDepth.needsUpdate = true
        uniforms.cameraMatrixWorld.value.copy(camera.matrixWorld)
        uniforms.cameraMatrixWorld.needsUpdate = true

        ref.current.position.x -= delta * speed

        mat.current.opacity = damp(mat.current.opacity, 1, .35, delta)

        if (store.getState().player.mesh) {
            uniforms.playerPosition.value.copy(camera.position)
            uniforms.playerPosition.needsUpdate = true
        }
    })

    let sx = useMemo(() => random.pick(-1, 1), [])
    let sx2 = useMemo(() => random.pick(-1, 1), [])
    let sx3 = useMemo(() => random.pick(-1, 1), [])
    let scale = useMemo(() => random.float(1, 1.5), [])

    return (
        <mesh
            {...props}
            geometry={g}
            ref={ref}
            userData={{ cloud: true }}
            scale={[sx * scale, sx3 * scale, sx2 * scale]}
            rotation-x={.2}
        >
            <meshBasicMaterial
                onBeforeCompile={onBeforeCompile}
                transparent
                map={text}
                ref={mat}
                attach="material"
                color="white"
                fog={false}
                depthWrite={false}
            />
        </mesh>
    )
}