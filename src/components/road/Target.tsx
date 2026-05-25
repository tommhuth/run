import { glsl } from "@components/materials/helpers"
import { useShader } from "@components/materials/useShader"
import { useLowerPriorityFrame } from "@data/hooks/utils"
import { reachDestination } from "@data/store/actions/road"
import { useStore } from "@data/store/store"
import { clamp, ndelta } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import easings from "@src/shaders/easings.glsl"
import noise from "@src/shaders/noise.glsl"
import { Color } from "three"

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
            uBlink: { value: 0 },
            uTimeoutColor: { value: new Color("#ff0066") }
        },
        shared: glsl` 
            uniform float uTime;
            uniform float uBlink;
            uniform float uColorProgress;
            uniform vec3 uTimeoutColor;
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
                float y = vPosition.y;
                float dist = 20.; 
                float fade = clamp(1. - y / dist, 0., 1.) * (clamp((y - .35) / 1., 0., 1.));
  
                vec3 color = mix(
                    vec3(1.0),
                    gl_FragColor.rgb,
                    easeOutCubic(clamp(y / 10., 0., 1.))
                );

                gl_FragColor.rgb = mix( 
                    color, 
                    uTimeoutColor,
                    uColorProgress
                );

                float n = smoothstep(.2, .8, noise(vPosition * .05 + uTime * .5));
                float d = 10. + uColorProgress * 10.;
                float f = easeInQuad(clamp(1. - y / d, 0., 1.));

                gl_FragColor.rgb = mix( 
                    gl_FragColor.rgb, 
                    mix(vec3(1., 1., 1.), vec3(1., 1., 0.), uColorProgress),
                    n * f
                );
 
                gl_FragColor.a = fade * abs(cos(uBlink)) * 1. * clamp((y - 1.) / .25, 0., 1.); 
            `
        }
    })

    useFrame((state, delta) => {
        uniforms.uTime.value += ndelta(delta)

        const { player } = useStore.getState()
        const t = (player.deadline - Date.now())
        const f = (1 - clamp(t / 4000)) * 7 + 5
        const c = 1 - clamp(t / 2000)

        uniforms.uColorProgress.value = c
        uniforms.uBlink.value += f * ndelta(delta)
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
                color={"#ffea00"}
                fog={true}
                onBeforeCompile={onBeforeCompile}
            //depthWrite={false}

            />
            <boxGeometry args={[width, height, .1]} />
        </mesh>
    )
}
