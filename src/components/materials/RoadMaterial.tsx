import { ROAD_HEIGHT, ROAD_WIDTH } from "@components/road/const"
import { aoMatrix } from "@data/ao"
import { store, useStore } from "@data/store/store"
import { clamp, dampFactor, ndelta } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import easings from "@src/shaders/easings.glsl"
import { Vec3 } from "cannon-es"
import { useEffect } from "react"
import { Matrix4, Vector3 } from "three"

import { glsl } from "./helpers"
import { useShader } from "./useShader"

export const MAX_TRAFFIC = 6

const _rotation = new Vec3()
const _position = new Vector3()

export default function RoadMaterial() {
    const aoTexture = useStore(i => i.aoTexture)
    const aoEnabled = useStore(i => i.debug.aoEnabled)
    const { uniforms, onBeforeCompile, customProgramCacheKey } = useShader({
        uniforms: {
            uRoadWidth: { value: ROAD_WIDTH * .53 },
            uAOTexture: { value: aoTexture },
            uAOMatrix: { value: new Matrix4() },
            uAOEnabled: { value: aoEnabled ? 1 : 0 },
            uRoadHeight: { value: ROAD_HEIGHT },
            uStripeWidth: { value: 0.25 },
            uDashSize: { value: 1.5 },
            uGapSize: { value: 1.5 },
            uTime: { value: 0 },
            uDestinationTime: { value: 0 },
            uTargetPosition: { value: new Vector3() },
            uPlayerPosition: { value: new Vector3() },
            uPlayerRotation: { value: 0 },
            uTrafficPositions: {
                value: Array.from({ length: MAX_TRAFFIC }).map(() => new Vector3())
            },
        },
        shared: glsl`
            uniform float uRoadWidth;
            uniform float uRoadHeight;
            uniform float uStripeWidth;
            uniform sampler2D uAOTexture;
            uniform mat4 uAOMatrix;
            uniform float uAOEnabled;
            uniform vec3 uPlayerPosition;
            uniform vec3 uTargetPosition;
            uniform float uPlayerRotation;
            uniform float uDestinationTime;
            uniform float uDashSize;
            uniform float uTime;
            uniform float uGapSize;
            uniform vec3 uTrafficPositions[${MAX_TRAFFIC}]; 
            varying vec3 vWorldPos;

            vec3 calcContactShadow(vec3 color, vec3 contactColor, float amount) {
                float size = 1.65;

                return mix(color, contactColor, smoothstep(.0, .76, 1. - amount / size));
            } 

            ${easings}
        `,
        vertex: {
            main: glsl`
                vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
            `
        },
        fragment: [
            {
                // make sure it happens before shadow calc
                injectAt: "#include <color_fragment>",
                main: glsl`
                    vec4 aoClip = uAOMatrix * vec4(vWorldPos, 1.0);
                    vec2 aoUV = aoClip.xy / aoClip.w * 0.5 + 0.5;
                    float aoSample = texture2D(uAOTexture, aoUV).r;

                    aoSample = mix(1.0, aoSample, uAOEnabled);

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

                    diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * .7, smoothstep(0., 1., vWorldPos.y / uRoadHeight));
                    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0) * 1.5, marking);

                     // fake contact shadow
                    vec3 playerDiff = vWorldPos - uPlayerPosition;
                    vec2 local = playerDiff.xz;

                    float a = uPlayerRotation;

                    // world -> local
                    mat2 invRot = mat2(
                        cos(a), sin(a),
                        -sin(a), cos(a)
                    );

                    local = invRot * local;

                    float playerContact = length(vec2(local.x, local.y * 0.75));
                    float aoStrength = .75;
                    vec3 contactShadowColor = mix(
                        diffuseColor.rgb,
                        vec3(0., 0., .1),
                        aoStrength
                    );

                    diffuseColor.rgb = calcContactShadow(diffuseColor.rgb, contactShadowColor, playerContact);

                    for (int i = 0; i < ${MAX_TRAFFIC}; i++) {
                        vec3 diff = vWorldPos - uTrafficPositions[i];
                        float trafficContact = length(vec2(diff.x, diff.z * 0.5));

                        diffuseColor.rgb = calcContactShadow(diffuseColor.rgb, contactShadowColor, trafficContact);  
                    }

                    diffuseColor.rgb = mix(contactShadowColor, diffuseColor.rgb, aoSample);

                `
            },
            {
                injectAt: "#include <dithering_fragment>",
                main: glsl` 
                    float lightSize = 4.5 + abs(cos(uTime * 4.));
                    float targetLightEffect = 1. - clamp(length(vWorldPos - uTargetPosition) / lightSize, 0., 1.);
                    vec3 targetLight = mix(
                        mix(vec3(.0, 0.1, .65), vec3(1., .85, 0.), uDestinationTime),
                        mix(vec3(.0, 0.2, .85), vec3(1., .65, 0.), uDestinationTime),
                        smoothstep(0., 1., smoothstep(0., 1., 1. - targetLightEffect))
                    );

                    gl_FragColor.rgb = mix(
                        gl_FragColor.rgb, 
                        mix(gl_FragColor.rgb, targetLight, smoothstep(0., 1.,  1. - length(vWorldPos - uPlayerPosition) / 60.)), 
                        easeInQuad(targetLightEffect)
                    ); 
                `
            }
        ]
    })

    useEffect(() => {
        uniforms.uAOTexture.value = aoTexture
    }, [aoTexture])

    useEffect(() => {
        uniforms.uAOEnabled.value = aoEnabled ? 1 : 0
    }, [aoEnabled])

    useFrame((state, delta) => {
        const { player, traffic } = store.getState()
        const k = dampFactor(20, ndelta(delta))

        uniforms.uAOMatrix.value.copy(aoMatrix)

        if (!player.vehicle) {
            return
        }

        player.vehicle.chassisBody.quaternion.toEuler(_rotation)

        uniforms.uPlayerPosition.value.lerp(player.vehicle.chassisBody.position, k)
        uniforms.uPlayerRotation.value = _rotation.y

        for (let i = 0; i < MAX_TRAFFIC; i++) {
            const el = traffic[i]

            uniforms.uTrafficPositions.value[i].lerp(_position.set(...el.position), k)
        }

        uniforms.uTargetPosition.value.set(0, ROAD_HEIGHT, player.nextTargetAt)
        uniforms.uTime.value += ndelta(delta)
        uniforms.uDestinationTime.value = clamp(1 - (Date.now() - player.deadline) / -300, 0, 1)
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
            name="road"
            dithering
        />
    )
}
