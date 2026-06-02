import { glsl } from "@components/materials/helpers"
import { useShader } from "@components/materials/useShader"
import { useLowerPriorityFrame } from "@data/hooks/utils"
import { reachDestination } from "@data/store/actions/road"
import { useStore } from "@data/store/store"
import { clamp, ndelta } from "@data/utils"
import { useFrame, useThree } from "@react-three/fiber"
import depth from "@src/shaders/depth.glsl"
import easings from "@src/shaders/easings.glsl"
import noise from "@src/shaders/noise.glsl"
import { useCallback, useEffect, useRef, useState } from "react"
import { Color, Vector2, Vector3 } from "three"

import { ROAD_WIDTH } from "./const"
import TargetTrail from "./TargetTrail"

const FADE_IN_DURATION = 0.35

export default function Target({
    height = 100,
    width = ROAD_WIDTH * .25
}) {
    const nextTargetAt = useStore(i => i.player.nextTargetAt)
    const depthTexture = useStore(i => i.depthTexture)
    const { camera, size, viewport } = useThree()
    const [prevTargetAt, setPrevTargetAt] = useState(nextTargetAt)
    const fadeStartRef = useRef(0)
    const { uniforms, onBeforeCompile, customProgramCacheKey } = useShader({
        uniforms: {
            uTime: { value: 0 },
            uColorProgress: { value: 0 },
            uFadeIn: { value: 1 },
            uHeight: { value: height },
            uSpeed: { value: 0 },
            uSize: { value: 3 },
            cameraNear: { value: camera.near },
            cameraFar: { value: camera.far },
            resolution: { value: new Vector2(size.width * viewport.dpr, size.height * viewport.dpr) },
            depthTexture: { value: depthTexture },
            uTimeoutColor: {
                value: new Color("#fffb00")
            },
            uChevronColor: {
                value: new Color("#5757d4")
            },
            uPlayerPosition: {
                value: new Vector3()
            },
        },
        shared: glsl` 
            uniform float uTime;
            uniform float uSpeed;
            uniform float uSize;
            uniform float uColorProgress; 
            uniform float uFadeIn;
            uniform float uHeight;
            uniform float cameraNear;
            uniform float cameraFar;
            uniform vec2 resolution;
            uniform sampler2D depthTexture;
            uniform vec3 uTimeoutColor;
            uniform vec3 uChevronColor; 
            uniform vec3 uPlayerPosition; 
            varying vec3 vPosition;
            varying vec2 vUv;

            ${noise}
            ${depth}
        `,
        vertex: {
            head: glsl``,
            main: glsl`
                vPosition = (modelMatrix * vec4(position, 1.)).xyz ;
                vUv = uv;
            `
        },
        fragment: {
            head: glsl` 
                ${easings} 
            `,
            main: glsl`     
                // world-space chevrons (v), scrolling down
                float wave = vPosition.y / uSize + uSpeed + uTime * 1. - abs(vPosition.x) / uSize;
                float pattern = easeInOutQuad(fract(wave));   
                float topFadeoutAt = 100.;
 
                gl_FragColor.rgb = mix(
                    mix(vec3(.0, .7, .7), vec3(1.0, .25, 0.), uColorProgress), 
                    mix(uChevronColor, uTimeoutColor, easeOutQuad(uColorProgress)), 
                    pattern
                );
                gl_FragColor.a = pattern;
                gl_FragColor.a *= easeInQuad(1. - clamp((vPosition.y - 1.) / topFadeoutAt, 0., 1.));

                // depth intersection fade
                float depthDist = getFragmentDepth(vPosition, depthTexture, gl_FragCoord.xy / resolution, viewMatrix, cameraNear, cameraFar);
                float fadeDist = .025;
                float depthFade = clamp(abs(depthDist) / fadeDist, 0.0, 1.0);
                
                // Fade out bottom  player is away
                float playerDist = length(vPosition - uPlayerPosition);
                float distFactor = smoothstep(35.0, 50.0, playerDist);
                float b = clamp(vPosition.y / 16.0, 0.0, 1.0);
                float bottomFade = mix(1.0, b, distFactor);

                // bottom-up reveal driven by uFadeIn (0 = hidden, 1 = fully revealed)
                float reveal = uFadeIn * (uHeight + 4.0);
                float revealMask = 1.0 - smoothstep(reveal - 4.0, reveal + 4.0, vPosition.y);

                gl_FragColor.a *= depthFade * bottomFade * revealMask; 
            `
        }
    })

    useEffect(() => {
        uniforms.depthTexture.value = depthTexture
        uniforms.resolution.value.set(size.width, size.height)
            .multiplyScalar(viewport.dpr)
    }, [size, depthTexture])

    useEffect(() => {
        if (prevTargetAt === nextTargetAt) {
            return
        }

        uniforms.uFadeIn.value = 0
        uniforms.uHeight.value = height
        fadeStartRef.current = 0
        setPrevTargetAt(nextTargetAt)
    }, [nextTargetAt, prevTargetAt, height, uniforms])

    const handleTrailComplete = useCallback(() => {
        fadeStartRef.current = performance.now() / 1000
    }, [])

    useFrame((state, delta) => {
        const { player } = useStore.getState()

        if (!player.vehicle) {
            return
        }
        uniforms.uTime.value += ndelta(delta)

        const t = (player.deadline - Date.now())
        const f = (1 - clamp(t / 5000)) * 5
        const c = 1 - clamp(t / 400)

        uniforms.uColorProgress.value = c
        uniforms.uSpeed.value += f * delta
        uniforms.uPlayerPosition.value.copy(player.vehicle.chassisBody.position)

        const fadeStart = fadeStartRef.current

        if (fadeStart > 0 && uniforms.uFadeIn.value < 1) {
            const now = performance.now() / 1000

            uniforms.uFadeIn.value = clamp((now - fadeStart) / FADE_IN_DURATION)
        }
    })

    useLowerPriorityFrame(() => {
        const { player: { vehicle } } = useStore.getState()

        if (!vehicle) {
            return
        }

        if (vehicle.chassisBody.position.z > nextTargetAt) {
            reachDestination()
        }
    }, 83)

    return (
        <>
            <mesh
                renderOrder={-1}
                userData={{ ignoreDepthWrite: true }}
                position={[0, height / 2, nextTargetAt]}
            >
                <meshBasicMaterial
                    customProgramCacheKey={customProgramCacheKey}
                    transparent
                    fog={false}
                    onBeforeCompile={onBeforeCompile}
                    name="target"
                />
                <boxGeometry args={[width, height, .1]} />
            </mesh>
            <TargetTrail
                from={prevTargetAt}
                to={nextTargetAt}
                width={width}
                height={height}
                onComplete={handleTrailComplete}
            />
        </>
    )
}
