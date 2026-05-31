import { glsl, setMatrixAt, setMatrixNullAt } from "@components/materials/helpers"
import { useShader } from "@components/materials/useShader"
import { CollisionEvent } from "@data/cannon"
import { useLowerPriorityFrame, useTransitionedState } from "@data/hooks/utils"
import IndexHandler from "@data/IndexHandler"
import { setState } from "@data/store/actions/actions"
import { store, useStore } from "@data/store/store"
import { clamp, dampFactor, ndelta } from "@data/utils"
import random from "@huth/random"
import { useFrame, useThree } from "@react-three/fiber"
import depth from "@src/shaders/depth.glsl"
import { Tuple3 } from "@src/types/global"
import { RigidVehicle, Vec3 } from "cannon-es"
import { useEffect, useMemo, useRef } from "react"
import { InstancedMesh as InstancedMeshThree, Vector2 } from "three"
import { Object3D } from "three/webgpu"

import useTrafficClient from "../traffic/useTrafficClient"
import Suv from "./Suv"
import { useControls } from "./useControls"

interface PlayerProps {
    position?: Tuple3
    rotation?: Tuple3
}

export default function Player({
    rotation,
}: PlayerProps) {
    const { motion } = useControls()
    const steering = useStore(i => i.player.steering)
    const [vehicle, setVehicle] = useTransitionedState<RigidVehicle | null>(null)
    const target = useMemo(() => new Object3D(), [])
    const [position, setPosition] = useTransitionedState<Tuple3>([-1.25, 2, 0])

    useTrafficClient({
        vehicle,
        type: "player",
        direction: 1
    })

    useEffect(() => {
        if (!vehicle) {
            return
        }

        const crashes = new Map<number, boolean>()
        const onCollide = ({ body }: CollisionEvent) => {
            if (body.userData?.type === "streetlight" && !crashes.has(body.id)) {
                vehicle.chassisBody.velocity.scale(.6, vehicle.chassisBody.velocity)
                crashes.set(body.id, true)
            }
        }

        vehicle.chassisBody.addEventListener("collide", onCollide)

        return () => {
            vehicle.chassisBody.removeEventListener("collide", onCollide)
        }
    }, [vehicle])

    // usePlayerAlive(setPosition)

    useEffect(() => {
        return setState({
            player: {
                ...store.getState().player,
                vehicle: vehicle,
                mesh: null
            }
        })
    }, [vehicle])

    useFrame(() => {
        if (!vehicle) {
            return
        }

        steering.z = motion.currentWheelForce
        steering.y = motion.currentSteering

        for (const wheel of [2, 3]) {
            vehicle.setWheelForce(motion.currentWheelForce, wheel)
        }

        for (const wheel of [0, 1]) {
            vehicle.setSteeringValue(motion.currentSteering, wheel)
        }
    })

    return (
        <>
            <Suv
                ref={setVehicle}
                position={position}
                rotation={rotation}
                key={position[2]}
            >
                <primitive object={target} position={[0, 1, 5]} />
                <spotLight
                    intensity={120}
                    position={[0, 1, .15]}
                    color={"#ffc079"}
                    angle={Math.PI * .3}
                    target={target}
                    penumbra={.5}
                />
            </Suv>
            <Smoker />
        </>
    )
}

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

const _vec3 = new Vec3()
const _right = new Vec3()
const _forward = new Vec3()
const _localRight = new Vec3(1, 0, 0)
const _localForward = new Vec3(0, 0, 1)

function Smoker({ count = 100 }) {
    const ref = useRef<InstancedMeshThree>(null)
    const smoke = useRef<Smoke[]>([])
    const indexHandler = useMemo(() => new IndexHandler(count), [count])
    const { camera, size, viewport } = useThree()
    const depthTexture = useStore(i => i.depthTexture)
    const { uniforms, onBeforeCompile, customProgramCacheKey } = useShader({
        uniforms: {
            uTime: { value: 0 },
            cameraNear: { value: camera.near },
            cameraFar: { value: camera.far },
            resolution: { value: new Vector2(size.width * viewport.dpr, size.height * viewport.dpr) },
            depthTexture: { value: depthTexture },
        },
        shared: glsl`
            uniform float uTime;
            uniform float cameraNear;
            uniform float cameraFar;
            uniform vec2 resolution;
            uniform sampler2D depthTexture;
            varying vec3 vWorldPosition;

            ${depth}
        `,
        vertex: {
            main: glsl`
                vWorldPosition = (instanceMatrix * vec4(position, 1.0)).xyz;
            `,
        },
        fragment: {
            main: glsl`
                float dist = getFragmentDepth(vWorldPosition, depthTexture, gl_FragCoord.xy / resolution, viewMatrix, cameraNear, cameraFar);
                float fadeDist = .0025;
                float depthFade = clamp(dist / fadeDist, 0.0, 1.0);

                gl_FragColor.a *= depthFade;
            `,
        },
    })

    useEffect(() => {
        uniforms.depthTexture.value = depthTexture
        uniforms.resolution.value.set(size.width, size.height)
            .multiplyScalar(viewport.dpr)
    }, [size, depthTexture])

    useLowerPriorityFrame((_, delta) => {
        const player = useStore.getState().player.vehicle
        const loading = useStore.getState().loading

        if (!player || loading) {
            return
        }

        const speed = player.chassisBody.velocity.length()
        const minSpeed = 2

        if (speed < minSpeed) {
            return
        }

        player.chassisBody.quaternion.vmult(_localRight, _right)
        player.chassisBody.quaternion.vmult(_localForward, _forward)

        const speedFactor = clamp((speed - 4) / 20, 0, 1)

        for (const wheelIndex of [2, 3]) {
            const wheel = player.wheelBodies[wheelIndex]
            const side = (wheelIndex + 1) % 2 === 0 ? -1 : 1

            _vec3.copy(player.chassisBody.velocity)
            _vec3.negate(_vec3)
            _vec3.scale(random.float(.1, .3), _vec3)

            _vec3.x += _right.x * side * random.float(.5, 1.5)
            _vec3.z += _right.z * side * random.float(.5, 1.5)
            _vec3.y = 0

            const pos: Tuple3 = [
                wheel.position.x + _forward.x * .5 + random.float(-.15, .15),
                wheel.position.y - .15,
                wheel.position.z + _forward.z * .5 + random.float(-.15, .15),
            ]

            smoke.current.push({
                id: random.id(),
                index: indexHandler.next(),
                size: random.float(.1, .25) * speedFactor,
                targetSize: random.float(.65, 1) + speedFactor * random.float(.1, .3),
                position: pos,
                velocity: _vec3.toArray(),
                growFactor: random.float(.005, .01),
                lifetime: 2500,
                time: 0
            })
        }

        uniforms.uTime.value += ndelta(delta)
    }, 4)

    useFrame((_, delta) => {
        if (!ref.current) {
            return
        }

        const nd = ndelta(delta)
        const list = smoke.current
        const dead: Smoke[] = []

        for (let i = list.length - 1; i >= 0; i--) {
            const s = list[i]

            s.time += nd * 1000

            if (s.size < s.targetSize) {
                s.size = Math.min(s.size + s.targetSize * nd * 3, s.targetSize)
            } else {
                s.size += nd * s.growFactor
            }

            if (s.time > s.lifetime) {
                dead.push(s)
                continue
            }

            s.position[0] += s.velocity[0] * nd
            s.position[1] -= nd * .7
            s.position[2] += s.velocity[2] * nd

            const t = dampFactor(.5, delta)

            s.velocity[0] += (0 - s.velocity[0]) * t
            s.velocity[2] += (0 - s.velocity[2]) * t

            setMatrixAt({
                instance: ref.current,
                index: s.index,
                position: s.position,
                scale: s.size,
            })
        }

        for (const s of dead) {
            const i = list.indexOf(s)

            if (i !== -1) {
                list.splice(i, 1)
                setMatrixNullAt(ref.current, s.index)
            }
        }
    })

    return (
        <instancedMesh
            ref={ref}
            args={[undefined, undefined, count]}
            frustumCulled={false}
            // receiveShadow
            // castShadow
            userData={{ ignoreDepthWrite: true }}
        >
            <sphereGeometry args={[1, 32, 32]} />
            <meshLambertMaterial
                transparent
                emissiveIntensity={.4}
                emissive={"#fff"}
                onBeforeCompile={onBeforeCompile}
                depthWrite={false}
                customProgramCacheKey={customProgramCacheKey}
            />
        </instancedMesh>
    )
}
