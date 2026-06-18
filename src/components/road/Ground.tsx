import { glsl } from "@components/materials/helpers"
import { useShader } from "@components/materials/useShader"
import { ShapeDefinition, useBody } from "@data/cannon"
import { depthIgnoreLayers } from "@data/hooks/useRenderWithDepth"
import { useStore } from "@data/store/store"
import { useFrame, useThree } from "@react-three/fiber"
import depth from "@src/shaders/depth.glsl"
import { Box, Plane, Quaternion, Vec3 } from "cannon-es"
import { useEffect, useRef } from "react"
import { DoubleSide, Mesh, Vector2, Vector3 } from "three"

import { ROAD_BASE_WIDTH, ROAD_FORWARD_EDGE, ROAD_HEIGHT, ROAD_WIDTH } from "./const"

const size = 200
const floorDefinition: ShapeDefinition = [
    [new Plane(), new Vec3(), new Quaternion().setFromEuler(-Math.PI * .5, 0, 0)],
    [new Plane(), new Vec3(-ROAD_WIDTH * 1.2, 0, 0), new Quaternion().setFromEuler(0, Math.PI * .5, 0)],
    [new Plane(), new Vec3(ROAD_WIDTH * 1.2, 0, 0), new Quaternion().setFromEuler(0, -Math.PI * .5, 0)],
]
const placeholderDepth = 250
const roadPlaceholder = new Box(new Vec3(ROAD_BASE_WIDTH / 2 - .5, ROAD_HEIGHT / 2, placeholderDepth + ROAD_FORWARD_EDGE))

function RoadEdge(props) {
    const depthTexture = useStore(i => i.depthTexture)
    const { camera, size, viewport } = useThree()
    const { uniforms, onBeforeCompile, customProgramCacheKey } = useShader({
        uniforms: {
            cameraNear: { value: camera.near },
            cameraFar: { value: camera.far },
            resolution: { value: new Vector2(size.width * viewport.dpr, size.height * viewport.dpr) },
            depthTexture: { value: depthTexture },
            uPlayerPosition: { value: new Vector3() },
        },
        shared: glsl`
            uniform float cameraNear;
            uniform float cameraFar;
            uniform vec2 resolution;
            uniform sampler2D depthTexture;
            uniform vec3 uPlayerPosition;
            varying vec3 vPosition;

            ${depth}
        `,
        vertex: {
            main: glsl`
                vPosition = (modelMatrix * vec4(position, 1.)).xyz;
            `
        },
        fragment: {
            main: glsl`
                // depth intersection fade
                float depthDist = getFragmentDepth(vPosition, depthTexture, gl_FragCoord.xy / resolution, viewMatrix, cameraNear, cameraFar);
                float fadeDist = .05;
                float depthFade = clamp(abs(depthDist) / fadeDist, 0.0, 1.0);

                gl_FragColor.a *= depthFade;
            `
        }
    })

    useEffect(() => {
        uniforms.depthTexture.value = depthTexture
        uniforms.resolution.value.set(size.width, size.height)
            .multiplyScalar(viewport.dpr)
    }, [size, depthTexture, viewport.dpr, uniforms])

    useFrame(() => {
        const player = useStore.getState().player.vehicle?.chassisBody

        if (player) {
            uniforms.uPlayerPosition.value.copy(player.position)
        }
    })

    return (
        <mesh
            {...props}
            layers={depthIgnoreLayers}
        >
            <meshBasicMaterial
                customProgramCacheKey={customProgramCacheKey}
                transparent
                fog={false}
                color="red"
                onBeforeCompile={onBeforeCompile}
                name="roadEdge"
                side={DoubleSide}
            />
            <boxGeometry args={[.1, 50, 50, 1, 1, 1]} />
        </mesh>
    )
}

export default function Ground() {
    const roadMaterial = useStore(i => i.materials.road)
    const groundRef = useRef<Mesh>(null)
    const [, roadBackup] = useBody({
        mass: 0,
        definition: roadPlaceholder,
    })

    useBody({
        mass: 0,
        definition: floorDefinition,
        position: [0, 0, 0],
    })

    useFrame(() => {
        const player = useStore.getState().player.vehicle?.chassisBody

        if (player && groundRef.current) {
            groundRef.current.position.z = player.position.z
            roadBackup.position.y = ROAD_HEIGHT / 2
            roadBackup.position.z = player.position.z
        }
    })

    return (
        <>
            <mesh
                ref={groundRef}
                position-y={-.5}
                castShadow
                receiveShadow
                material={roadMaterial}
            >
                <boxGeometry args={[size, 1, size, 1, 1, 1]} />
            </mesh>
        </>
    )
}
