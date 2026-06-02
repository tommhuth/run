import { glsl, setMatrixAt, setMatrixNullAt } from "@components/materials/helpers"
import { useShader } from "@components/materials/useShader"
import { useInstanceClear } from "@data/hooks/useInstanceClear"
import { clamp } from "@data/utils"
import random from "@huth/random"
import { Line } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import noise from "@src/shaders/noise.glsl"
import { Tuple3 } from "@src/types/global"
import { useEffect, useMemo, useState } from "react"
import { CatmullRomCurve3, InstancedMesh, Vector3 } from "three"

import { ROAD_HEIGHT } from "./const"

type Particle = {
    offset: Tuple3
    startTime: number
    duration: number
    scale: number
    active: boolean
    index: number
}

interface TrailData {
    particles: Particle[]
    curve: CatmullRomCurve3
    completeAt: number
    completed: boolean
}

function easeOutQuad(x: number): number {
    return 1 - (1 - x) * (1 - x)
}

const position = new Vector3()

interface TargetTrailProps {
    from: number
    to: number
    width: number
    height: number
    debug?: boolean
    count?: number
    onComplete?: () => void
}

export default function TargetTrail({
    from,
    to,
    width,
    height,
    debug = false,
    count = 200,
    onComplete,
}: TargetTrailProps) {
    const [instance, setInstance] = useState<InstancedMesh | null>(null)
    const [debugPoints, setDebugPoints] = useState<Vector3[]>([])
    const data = useMemo<TrailData>(() => {
        const points = Array.from({ length: 3 })
            .map(() => new Vector3())

        return {
            particles: Array.from({ length: count }, (i, index) => ({
                offset: [0, 0, 0],
                startTime: 0,
                duration: 1,
                scale: 0,
                active: false,
                index,
            })),
            curve: new CatmullRomCurve3(points, false, "catmullrom", .6),
            completeAt: 0,
            completed: true,
        }
    }, [])
    const { customProgramCacheKey, onBeforeCompile } = useShader({
        uniforms: {
            uFadeNear: { value: 30 },
            uFadeFar: { value: 220 },
        },
        shared: glsl`
            varying float vCameraDist;
            varying vec3 vWorldPosition;
            uniform float uFadeNear;
            uniform float uFadeFar;

            ${noise}
        `,
        vertex: {
            head: glsl``,
            main: glsl`
                vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.);

                vWorldPosition = (instanceMatrix * vec4(position, 1.)).xyz;
                vCameraDist = -mv.z;
            `,
        },
        fragment: {
            head: glsl``,
            main: glsl`
                float distFade = 1.0 - smoothstep(uFadeNear, uFadeFar, vCameraDist) * 0.75;

                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb,
                    mix(gl_FragColor.rgb, vec3(1.), .4),
                    smoothstep(.2, .8, noise(vWorldPosition * .05 + vCameraDist * .01))
                );

                gl_FragColor.a *= distFade;
            `,
        },
    })

    useInstanceClear(instance, count)

    useEffect(() => {
        if (from === to) {
            return
        }

        const { particles, curve } = data
        const now = performance.now() / 1000
        const spawnWidth = width * 1.25
        const minY = ROAD_HEIGHT
        const maxY = 10

        curve.points[0].set(0, 0, from)
        curve.points[1].set(0, height * .3, from + (to - from) * .45)
        curve.points[2].set(0, 0, to)
        curve.updateArcLengths()

        if (debug) {
            setDebugPoints(curve.getPoints(128))
        }

        const length = curve.getLength()
        const baseDuration = length / 80

        data.completeAt = now + baseDuration * 0.8
        data.completed = false

        for (const particle of particles) {
            const bx = random.float(-1, 1)
            const by = random.float(-1, 1)
            const bz = random.float(-1, 1)
            const midY = (minY + maxY) / 2
            const halfY = (maxY - minY) / 2

            // bias offsets toward center 
            particle.offset = [
                bx ** 3 * (spawnWidth / 2),
                midY + by ** 3 * halfY,
                bz ** 3
            ]
            particle.duration = baseDuration * random.float(.8, 1.4)
            particle.startTime = now + random.float(0, 0.35)
            particle.scale = random.float(0.02, .2)
            particle.active = true
        }
    }, [from, to, width, height, data])

    useFrame(() => {
        if (!instance) {
            return
        }

        const { particles, curve } = data
        const now = performance.now() / 1000

        if (!data.completed && now >= data.completeAt) {
            data.completed = true
            onComplete?.()
        }

        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i]

            if (!particle.active) {
                continue
            }

            const t = (now - particle.startTime) / particle.duration

            if (t < 0 || t >= 1) {
                particle.active = t < 0
                setMatrixNullAt(instance, particle.index)

                continue
            }

            const eased = easeOutQuad(t)

            curve.getPoint(eased, position)
            position.x += particle.offset[0]
            position.y += particle.offset[1]
            position.z += particle.offset[2]

            setMatrixAt({
                instance,
                index: particle.index,
                position,
                scale: (particle.scale + eased * .35) * clamp(1 - (t - .6) / .4, 0, 1),
            })
        }
    })

    return (
        <>
            <instancedMesh
                ref={setInstance}
                args={[undefined, undefined, count]}
                frustumCulled={false}
            >
                <sphereGeometry args={[1, 6, 6]} />
                <meshBasicMaterial
                    color="#3a34eb"
                    name="trail"
                    fog={false}
                    transparent
                    customProgramCacheKey={customProgramCacheKey}
                    onBeforeCompile={onBeforeCompile}
                />
            </instancedMesh>
            {debug && debugPoints.length > 0 && (
                <Line
                    points={debugPoints}
                    color="#f00"
                    transparent
                    opacity={0.9}
                    depthTest={false}
                    renderOrder={999}
                    frustumCulled={false}
                />
            )}
        </>
    )
}
