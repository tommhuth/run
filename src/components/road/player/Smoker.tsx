import { glsl, setMatrixAt, setMatrixNullAt } from "@components/materials/helpers"
import { useShader } from "@components/materials/useShader"
import { useInstanceClear } from "@data/hooks/useInstanceClear"
import { useLowerPriorityFrame } from "@data/hooks/utils"
import IndexHandler from "@data/IndexHandler"
import { useStore } from "@data/store/store"
import { clamp, dampFactor, ndelta } from "@data/utils"
import random from "@huth/random"
import { useFrame, useThree } from "@react-three/fiber"
import depth from "@src/shaders/depth.glsl"
import { Tuple3 } from "@src/types/global"
import { Vec3 } from "cannon-es"
import { useEffect, useMemo, useState } from "react"
import { InstancedMesh as InstancedMeshThree, Vector2 } from "three"

interface Smoke {
    position: Tuple3
    velocity: Tuple3
    size: number
    targetSize: number
    growFactor: number
    lifetime: number
    time: number
    index: number
    id: string
}

interface SmokerData {
    smoke: Smoke[]
    indexHandler: IndexHandler
}

const _velocity = new Vec3()
const _right = new Vec3()
const _forward = new Vec3()
const _localRight = new Vec3(1, 0, 0)
const _localForward = new Vec3(0, 0, 1)

export default function Smoker({ count = 100 }) {
    const [instance, setInstance] = useState<InstancedMeshThree | null>(null)
    const data = useMemo<SmokerData>(() => {
        return {
            smoke: [],
            indexHandler: new IndexHandler(count)
        }
    }, [count])
    const { camera, size, viewport } = useThree()
    const depthTexture = useStore(i => i.depthTexture)
    const { uniforms, onBeforeCompile, customProgramCacheKey } = useShader({
        defines: {
            USE_SHADOWMAP: "",
        },
        uniforms: {
            cameraNear: { value: camera.near },
            cameraFar: { value: camera.far },
            resolution: {
                value: new Vector2(size.width * viewport.dpr, size.height * viewport.dpr)
            },
            depthTexture: { value: depthTexture },
        },
        shared: glsl` 
            uniform float cameraNear;
            uniform float cameraFar;
            uniform vec2 resolution;
            uniform sampler2D depthTexture;
            varying vec3 vWorldPosition;

            ${depth}
        `,
        vertex: {
            main: glsl`
                vec4 _smokeWorldPos = modelMatrix * instanceMatrix * vec4(position, 1.0);
                vWorldPosition = _smokeWorldPos.xyz;

                // make sure this is defined since we're doing it manually
                #if defined(USE_SHADOWMAP) && NUM_DIR_LIGHT_SHADOWS > 0
                    #pragma unroll_loop_start

                    for (int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i++) {
                        vDirectionalShadowCoord[i] = directionalShadowMatrix[i] * _smokeWorldPos;
                    }

                    #pragma unroll_loop_end
                #endif
            `,
        },
        fragment: {
            main: glsl`
                float dist = getFragmentDepth(vWorldPosition, depthTexture, gl_FragCoord.xy / resolution, viewMatrix, cameraNear, cameraFar);
                float fadeDist = .0025;
                float depthFade = clamp(dist / fadeDist, 0.0, 1.0);

                gl_FragColor.a *= depthFade;

                // we dont want smoke to cast shadow only recieve
                // hardcode some shadow here instead
                #if defined(USE_SHADOWMAP) && NUM_DIR_LIGHT_SHADOWS > 0
                    float shadowValue = getShadow(
                        directionalShadowMap[0],
                        directionalLightShadows[0].shadowMapSize,
                        directionalLightShadows[0].shadowIntensity,
                        directionalLightShadows[0].shadowBias,
                        directionalLightShadows[0].shadowRadius,
                        vDirectionalShadowCoord[0]
                    );

                    gl_FragColor.rgb = mix(
                        gl_FragColor.rgb * .75 + vec3(0., .085, .15),
                        gl_FragColor.rgb,
                        shadowValue
                    );
                #endif
            `,
        },
    })

    useInstanceClear(instance, count)

    useEffect(() => {
        uniforms.depthTexture.value = depthTexture
        uniforms.resolution.value.set(size.width, size.height)
            .multiplyScalar(viewport.dpr)
    }, [size, depthTexture])

    useLowerPriorityFrame(() => {
        const { player: { vehicle }, loading } = useStore.getState()

        if (!vehicle || loading) {
            return
        }

        const speed = vehicle.chassisBody.velocity.length()
        const minSpeed = 2

        if (speed < minSpeed) {
            return
        }

        vehicle.chassisBody.quaternion.vmult(_localRight, _right)
        vehicle.chassisBody.quaternion.vmult(_localForward, _forward)

        // increase size when going fast
        const speedFactor = clamp((speed - 4) / 20, 0, 1)

        for (const wheelIndex of [2, 3]) {
            const wheel = vehicle.wheelBodies[wheelIndex]
            const side = (wheelIndex + 1) % 2 === 0 ? -1 : 1

            _velocity.copy(vehicle.chassisBody.velocity)
            _velocity.negate(_velocity)
            _velocity.scale(random.float(.1, .3), _velocity)

            _velocity.x += _right.x * side * random.float(.5, 1.5)
            _velocity.z += _right.z * side * random.float(.5, 1.5)
            _velocity.y = 0

            const position: Tuple3 = [
                wheel.position.x + _forward.x * .5 + random.float(-.15, .15),
                wheel.position.y - .15,
                wheel.position.z + _forward.z * .5 + random.float(-.15, .15),
            ]

            data.smoke.push({
                id: random.id(),
                index: data.indexHandler.next(),
                size: random.float(.1, .25) * speedFactor,
                targetSize: random.float(.5, 1.1) + speedFactor * random.float(.1, .2),
                position,
                velocity: _velocity.toArray(),
                growFactor: random.float(.005, .01),
                lifetime: 2500,
                time: 0
            })
        }
    }, 70)

    useFrame((_, delta) => {
        if (!instance) {
            return
        }

        const nd = ndelta(delta)
        const list = data.smoke
        const dead: Smoke[] = []

        for (const smoke of list) {
            smoke.time += nd * 1000

            if (smoke.time > smoke.lifetime) {
                dead.push(smoke)
                continue
            }

            if (smoke.size < smoke.targetSize) {
                smoke.size = Math.min(smoke.size + smoke.targetSize * nd * 3, smoke.targetSize)
            } else {
                smoke.size += nd * smoke.growFactor
            }

            smoke.position[0] += smoke.velocity[0] * nd
            smoke.position[1] -= .7 * nd
            smoke.position[2] += smoke.velocity[2] * nd

            const t = dampFactor(.5, nd)

            smoke.velocity[0] += -smoke.velocity[0] * t
            smoke.velocity[2] += -smoke.velocity[2] * t

            setMatrixAt({
                instance,
                index: smoke.index,
                position: smoke.position,
                scale: smoke.size,
            })
        }

        for (const smoke of dead) {
            const index = list.indexOf(smoke)

            if (index !== -1) {
                list.splice(index, 1)
                setMatrixNullAt(instance, smoke.index)
            }
        }
    })

    return (
        <instancedMesh
            ref={setInstance}
            args={[undefined, undefined, count]}
            frustumCulled={false}
            userData={{ ignoreDepthWrite: true }}
        >
            <sphereGeometry args={[1, 16, 16]} />
            <meshLambertMaterial
                transparent
                emissiveIntensity={.4}
                emissive={"#fff"}
                name="smoke"
                onBeforeCompile={onBeforeCompile}
                depthWrite={false}
                customProgramCacheKey={customProgramCacheKey}
            />
        </instancedMesh>
    )
}
