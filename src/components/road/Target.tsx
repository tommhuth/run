import { glsl } from "@components/materials/helpers"
import { useShader } from "@components/materials/useShader"
import { useLowerPriorityFrame } from "@data/hooks/utils"
import { reachDestination } from "@data/store/actions/road"
import { useStore } from "@data/store/store"
import { clamp, ndelta } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import easings from "@src/shaders/easings.glsl"
import noise from "@src/shaders/noise.glsl"
import { Color, DoubleSide } from "three"

import { ROAD_WIDTH } from "./const"

export default function Target({
    height = 30,
    width = ROAD_WIDTH * .5
}) {
    const nextTargetAt = useStore(i => i.player.nextTargetAt)
    const { uniforms, onBeforeCompile, customProgramCacheKey } = useShader({
        uniforms: {
            uTime: { value: 0 },
            uColorProgress: { value: 0 },
            uSpeed: { value: 0 },
            uSize: { value: 2 },
            uTimeoutColor: {
                value: new Color("#e62796")
            },
            uChevronColor: {
                value: new Color("#5757d4")
            },
        },
        shared: glsl` 
            uniform float uTime;
            uniform float uSpeed;
            uniform float uSize;
            uniform float uColorProgress; 
            uniform vec3 uTimeoutColor;
            uniform vec3 uChevronColor; 
            varying vec3 vPosition;
            varying vec2 vUv;

            ${noise}
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
                float wave = vPosition.y / uSize + uSpeed + uTime * 2. - abs(vPosition.x) / uSize;
                float pattern = fract(wave);   
 
                gl_FragColor.rgb = mix(
                    mix(gl_FragColor.rgb, vec3(1., 1., 0.), uColorProgress), 
                    mix(uChevronColor, uTimeoutColor, uColorProgress), 
                    pattern
                );
                gl_FragColor.a = pattern;
                gl_FragColor.a *= easeInQuad(1. - clamp((vPosition.y - 1.) / 25., 0., 1.));
            `
        }
    })

    useFrame((state, delta) => {
        uniforms.uTime.value += ndelta(delta)

        const { player } = useStore.getState()
        const t = (player.deadline - Date.now())
        const f = (1 - clamp(t / 5000)) * 5
        const c = 1 - clamp(t / 1000)

        uniforms.uColorProgress.value = c
        uniforms.uSpeed.value += f * delta
    })

    useLowerPriorityFrame(() => {
        const { player: { vehicle } } = useStore.getState()
        const playerDepth = 2.5

        if (!vehicle) {
            return
        }

        if (vehicle.chassisBody.position.z + playerDepth / 2 > nextTargetAt) {
            reachDestination()
        }
    }, 5)

    return (
        <mesh
            renderOrder={-1}
            receiveShadow
            position={[0, height / 2, nextTargetAt]}
        >
            <meshBasicMaterial
                customProgramCacheKey={customProgramCacheKey}
                transparent
                color={"#000"}
                onBeforeCompile={onBeforeCompile}

            />
            <boxGeometry args={[width, height, .1]} />
        </mesh>
    )
}
