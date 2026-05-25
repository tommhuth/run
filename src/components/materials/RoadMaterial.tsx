import { ROAD_WIDTH } from "@components/road/const"
import { store } from "@data/store/store"
import { dampFactor } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import { Vector3 } from "three"

import { glsl } from "./helpers"
import { useShader } from "./useShader"
import { useEffect } from "react"

export const MAX_TRAFFIC = 8

export default function RoadMaterial() {
    const { uniforms, onBeforeCompile, customProgramCacheKey } = useShader({
        uniforms: {
            uRoadWidth: { value: ROAD_WIDTH * .53 },
            uStripeWidth: { value: 0.25 },
            uDashSize: { value: 1.5 },
            uGapSize: { value: 1.5 },
            uPlayerPosition: { value: new Vector3() },
            uTrafficPositions: {
                value: Array.from({ length: MAX_TRAFFIC }).map(() => new Vector3())
            },
        },
        shared: glsl`
            uniform float uRoadWidth;
            uniform float uStripeWidth;
            uniform vec3 uPlayerPosition;
            uniform float uDashSize;
            uniform float uGapSize;
            uniform vec3 uTrafficPositions[${MAX_TRAFFIC}]; 
            varying vec3 vWorldPos;

            vec3 calcContactShadow(vec3 color, vec3 contactColor, float amount) {
                return  mix(color, contactColor, smoothstep(.2, .8, 1. - amount / 2.));
            } 
        `,
        vertex: {
            main: glsl`
                vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
            `
        },
        fragment: {
            // make sure it happens before shadow calc
            injectAt: "#include <color_fragment>",
            main: glsl`
                float halfRoad = uRoadWidth * 0.5;
                float x = vWorldPos.x;
                float z = vWorldPos.z;

                // Solid edge stripes
                float leftEdge = step(halfRoad - uStripeWidth, abs(x)) * step(abs(x), halfRoad);
                float rightEdge = leftEdge;

                // Dashed center stripe
                float centerStripe = step(abs(x), uStripeWidth * 0.5);
                float dashPattern = step(mod(z, uDashSize + uGapSize), uDashSize);
                float centerDash = centerStripe * dashPattern;

                float marking = max(leftEdge, centerDash);

                diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0) * 1.5, marking);

                // fake contact shadow
                vec3 playerDiff = vWorldPos - uPlayerPosition;
                float playerContact = length(vec2(playerDiff.x, playerDiff.z * 0.5));
                float contactShadowStrength = .8;
                vec3 contactShadowColor = mix(diffuseColor.rgb, vec3(0.), contactShadowStrength);

                diffuseColor.rgb = calcContactShadow(diffuseColor.rgb, contactShadowColor, playerContact);

                for (int i = 0; i < ${MAX_TRAFFIC}; i++) {
                    vec3 diff = vWorldPos - uTrafficPositions[i];
                    float trafficContact = length(vec2(diff.x, diff.z * 0.5));

                    diffuseColor.rgb = calcContactShadow(diffuseColor.rgb, contactShadowColor, trafficContact);  
                }
            `
        }
    })

    useFrame((state, delta) => {
        const { player, traffic } = store.getState()
        const k = dampFactor(20, delta)

        if (!player.vehicle) {
            return
        }

        uniforms.uPlayerPosition.value.lerp(player.vehicle.chassisBody.position, k)

        for (let i = 0; i < MAX_TRAFFIC; i++) {
            const el = traffic[i]

            uniforms.uTrafficPositions.value[i].lerp(new Vector3(...el.position), k)
        }
    })

    useEffect(() => {
        // if traffic changes, do immediate sync
        return store.subscribe(
            store => store.traffic,
            traffic => {
                for (let i = 0; i < MAX_TRAFFIC; i++) {
                    const el = traffic[i]

                    uniforms.uTrafficPositions.value[i].set(...el.position)
                }
            })
    }, [])

    return (
        <meshPhongMaterial
            customProgramCacheKey={customProgramCacheKey}
            onBeforeCompile={onBeforeCompile}
            color={"#d9e1e9"}
            dithering
        />
    )
}
