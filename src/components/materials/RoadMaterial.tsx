import { ROAD_WIDTH } from "@components/road/const"

import { glsl } from "./helpers"
import { useShader } from "./useShader"

export default function RoadMaterial() {
    const { onBeforeCompile, customProgramCacheKey } = useShader({
        uniforms: {
            uRoadWidth: { value: ROAD_WIDTH * .53 },
            uStripeWidth: { value: 0.25 },
            uDashSize: { value: 1.5 },
            uGapSize: { value: 1.5 },
        },
        shared: glsl`
            uniform float uRoadWidth;
            uniform float uStripeWidth;
            uniform float uDashSize;
            uniform float uGapSize;
            varying vec3 vWorldPos;
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
            `
        }
    })

    return (
        <meshPhongMaterial
            customProgramCacheKey={customProgramCacheKey}
            onBeforeCompile={onBeforeCompile}
            color={"#d9e1e9"}
            dithering
        />
    )
}
