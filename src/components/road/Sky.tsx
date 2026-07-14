import { store } from "@data/store/store"
import { useFrame } from "@react-three/fiber"
import noise from "@src/shaders/noise.glsl"
import { useRef } from "react"
import { Color, DoubleSide, Mesh, ShaderMaterial, Vector3 } from "three"

import { ROAD_FORWARD_EDGE } from "./const"

const RADIUS = ROAD_FORWARD_EDGE + 10

const material = new ShaderMaterial({
    side: DoubleSide,
    depthWrite: false,
    wireframe: false,
    uniforms: {
        topColor: { value: new Color("#dae3eb") },
        bottomColor: { value: new Color("#ffffff") },
        cloudColor: { value: new Color("#fff") },
        radius: { value: RADIUS },
        playerPosition: { value: new Vector3() },
        uTime: { value: 0 },
    },
    vertexShader: /* glsl */`
        varying vec3 vWorldPosition;

        void main() {
            vWorldPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
    fragmentShader: /* glsl */`
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform vec3 cloudColor;
        uniform float radius;
        uniform vec3 playerPosition;
        uniform float uTime;
        varying vec3 vWorldPosition;

        ${noise}

        // layered noise for soft cloud puffs.
        float fbm(vec2 p) {
            float value = 0.0;
            float amp = 0.5;

            for (int i = 0; i < 4; i++) {
                value += amp * noise(p);
                p *= 2.0;
                amp *= 0.5;
            }
            return value;
        }

        void main() {
            // Direction from sphere center to fragment (sky dome direction).
            vec3 dir = normalize(vWorldPosition);

            // Base vertical gradient.
            float h = clamp(vWorldPosition.y / radius, -1.0, 1.0);
            float t = smoothstep(0.1, 1.0, h);
            vec3 sky = mix(bottomColor, topColor, t);

            // Project the dome direction onto a horizontal plane to get cloud UVs.
            // Dividing by dir.y "spreads" clouds toward the horizon.
            vec2 cloudUv = dir.xz / max(dir.y, 0.1);
            cloudUv *= 0.6;
            cloudUv += uTime * 0.05;

            float clouds = fbm(cloudUv);
            // Threshold + soft edges so clouds look like puffs rather than a haze.
            clouds = smoothstep(0.3, 0.6, clouds);

            // Fade clouds out below the horizon and at the zenith so the gradient reads cleanly.
            float horizonMask = smoothstep(0.05, 0.35, dir.y) * smoothstep(1.0, 0.6, dir.y);
            clouds *= horizonMask;

            vec3 color = mix(sky, cloudColor, clouds * 0.85);
            gl_FragColor = vec4(color, 1.0);
        }
      `,
})

export function Sky() {
    const ref = useRef<Mesh>(null)

    useFrame(({ camera }, delta) => {
        if (ref.current) {
            ref.current.position.z = camera.position.z
            ref.current.position.x = camera.position.x
        }

        material.uniforms.uTime.value += delta

        const { player } = store.getState()

        if (player.vehicle) {
            material.uniforms.playerPosition.value.copy(player.vehicle.chassisBody.position)
        }
    })

    return (
        <mesh
            ref={ref}
            material={material}
            frustumCulled={false}
            renderOrder={-1000}
            scale={[1, .5, 1]}
        >
            <sphereGeometry args={[RADIUS, 32, 32]} />
        </mesh>
    )
}
