import cloudImage from "@assets/textures/11.png"
import { glsl } from "@components/materials/helpers"
import { useShader } from "@components/materials/useShader"
import { store, useStore } from "@data/store"
import { ndelta } from "@data/utils"
import { useTexture } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import easings from "@src/shaders/easings.glsl"
import { Tuple3 } from "@src/types/global"
import { memo, useEffect, useLayoutEffect, useRef } from "react"
import { BufferGeometry, DoubleSide, Euler, Group, Mesh, MeshLambertMaterial, PlaneGeometry, Quaternion, Vector2, Vector3 } from "three"
import { damp } from "three/src/math/MathUtils.js"

const geometry = new PlaneGeometry(12, 6, 1, 1)

geometry.rotateY(Math.PI * 1)

export interface CloudProps {
    damping: number
    speed: number
    position: Tuple3
    scale?: number
    id: string
}

let _euler = new Euler()
let _quaternion = new Quaternion()

function Cloud({
    speed,
    position,
    damping,
    scale,
}: CloudProps) {
    const map = useTexture(cloudImage)
    const ref = useRef<Group>(null)
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
			varying vec3 worldPosition;
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
                worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            `
        },
        fragment: {
            main: glsl` 
                vec2 uv = gl_FragCoord.xy / resolution.xy; 
                float sceneDepth = linearizeDepth(texture2D(depthTexture, uv).r, cameraNear, cameraFar);
                float fragmentDepth = getLinearDepth(worldPosition, viewMatrix, cameraNear, cameraFar);
  
                float extraDist = clamp(length(worldPosition - playerPosition) / 25., 0., 1.) * .075;
                float fadeDist = .025 + extraDist; // 150 depth
                float minDist = 0.;   
                float dist = sceneDepth - fragmentDepth;  
                float alpha = clamp((dist - minDist) / fadeDist, 0.0, 1.0);

                gl_FragColor.a *= easeInOutQuad(alpha);  
            `
        }
    })

    useEffect(() => {
        uniforms.depthTexture.value = depthTexture
        uniforms.resolution.value.set(size.width, size.height)
            .multiplyScalar(viewport.dpr)
    }, [size, depthTexture])

    useLayoutEffect(() => {
        let mesh = ref.current?.children[0] as Mesh<BufferGeometry, MeshLambertMaterial>

        if (!mesh) {
            return
        }

        mesh.material.opacity = 0
    }, [position])

    useFrame(() => {
        const { player: { vehicle } } = store.getState()

        if (vehicle) {
            uniforms.playerPosition.value.copy(vehicle.chassisBody.position)
        }
    })

    useFrame((state, delta) => {
        let { player: { vehicle } } = store.getState()
        let mesh = ref.current?.children[0] as Mesh<BufferGeometry, MeshLambertMaterial>

        if (!ref.current || !vehicle) {
            return
        }

        _euler.setFromQuaternion(_quaternion.copy(vehicle.chassisBody.quaternion))

        mesh.material.opacity = damp(mesh.material.opacity, 1, damping, ndelta(delta))
        ref.current.position.x -= ndelta(delta) * speed
        ref.current.rotation.y = _euler.y
    })

    return (
        <group
            ref={ref}
            userData={{ ignoreDepthWrite: true }}
            position={position}
            scale={scale}
        >
            <mesh geometry={geometry}>
                <meshBasicMaterial
                    onBeforeCompile={onBeforeCompile}
                    transparent
                    map={map}
                    name="cloud"
                    color={"#7ab2e0"}
                    fog={true}
                    dispose={null}
                    depthWrite={false}
                    side={DoubleSide}
                />
            </mesh>
            <mesh
                geometry={geometry}
                visible={false}
            >
                <meshBasicMaterial
                    color="red"
                    wireframe
                    depthWrite={false}
                    dispose={null}
                />
            </mesh>
        </group>
    )
}

export default memo(Cloud)
