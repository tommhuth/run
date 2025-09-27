import { GSSolver, SplitSolver, World, Body as CannonBody, Vec3, Shape, Quaternion as CannonQuaternion, ContactEquation, Quaternion, SAPBroadphase } from "cannon-es"
import React, { useRef, useEffect, useContext, useMemo, useLayoutEffect, ReactNode } from "react"
import { invalidate, useFrame, useThree } from "@react-three/fiber"
import { Mesh, InstancedMesh } from "three"
import { setMatrixAt, setMatrixNullAt } from "./utils"
import createCannonDebugger from "cannon-es-debugger"
import useAnimationFrame from "use-animation-frame"
import { Tuple3 } from "src/types/global"

export type ShapeDefinition = Shape | [Shape, Vec3?, CannonQuaternion?][]

interface BaseBodyOptions<T = unknown> {
    definition: ShapeDefinition
    mass: number
    velocity?: Tuple3
    position?: Tuple3
    rotation?: Tuple3
    angularDamping?: number
    linearDamping?: number
    allowSleep?: boolean
    userData?: Record<string, T>
}

const context = React.createContext(null as unknown as World)

export type CollisionEvent = { body: Body, target: Body, contact: ContactEquation }


export class Body<T = unknown> extends CannonBody {
    userData: Record<string, T> = {}
}

export function useCannonWorld() {
    return useContext(context)
}

export const DEFAULT_RESTITUTION = .5
export const DEFAULT_ITERATIONS = 10
export const DEFAULT_GRAVITY: Tuple3 = [0, -13.8, 0]

function useCannonBody({
    definition,
    mass,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    linearDamping,
    angularDamping,
    velocity = [0, 0, 0],
    userData = {},
    allowSleep = true,
}: BaseBodyOptions) {
    const body = useMemo(() => {
        const body = new Body({
            mass,
            allowSleep,
            sleepSpeedLimit: .1,
            position: new Vec3(...position),
            velocity: new Vec3(...velocity),
            shape: !Array.isArray(definition) ? definition : undefined,
            quaternion: new Quaternion().setFromEuler(...rotation),
            angularDamping,
            linearDamping,
        })

        if (Array.isArray(definition)) {
            for (const shapeDefinition of definition) {
                body.addShape(...shapeDefinition)
            }
        }

        return body
    }, [mass, definition])
    const world = useCannonWorld()

    useEffect(() => {
        body.userData = userData
    }, [userData, body])

    useEffect(() => {
        world.addBody(body)

        return () => {
            world.removeBody(body)
        }
    }, [body, world])

    return [body, world] as const
}

interface CannonProviderProps {
    gravity?: Tuple3
    defaultRestitution?: number
    iterations?: number
    debug?: boolean
    children: ReactNode
}

export function CannonProvider({
    children,
    gravity = DEFAULT_GRAVITY,
    defaultRestitution = DEFAULT_RESTITUTION,
    iterations = DEFAULT_ITERATIONS,
    debug = false,
}: CannonProviderProps) {
    const { scene } = useThree()
    const world = useMemo(() => {
        const solver = new SplitSolver(new GSSolver())

        solver.iterations = iterations

        const world = new World({
            solver,
            allowSleep: true,
            gravity: new Vec3(...gravity),
        })

        world.broadphase = new SAPBroadphase(world)
        world.defaultContactMaterial.restitution = defaultRestitution

        return world
    }, [iterations, ...gravity])
    const cannonDebugger = useMemo(() => {
        return debug ? createCannonDebugger(scene, world, { color: "red" }) : null
    }, [world, scene, debug])

    // dont use useFrame here since r3f will stop firing those   
    // and we need to constantly watch over any hasActiveBodies
    useAnimationFrame(({ delta }) => {
        // max 15fps as delta
        const dt = Math.min(delta, 1 / 15)

        world.step(dt)

        if (world.hasActiveBodies) {
            invalidate()

            if (cannonDebugger) {
                cannonDebugger.update()
            }
        }
    })

    return (
        <context.Provider value={world}>
            {children}
        </context.Provider>
    )
}

export function useBody({ mass, ...rest }: BaseBodyOptions) {
    const ref = useRef<Mesh>(null)
    const [body] = useCannonBody({ mass, ...rest })

    useLayoutEffect(() => {
        if (ref.current) {
            ref.current.position.copy(body.position)
            ref.current.quaternion.copy(body.quaternion)
        }
    }, [])

    useFrame(() => {
        if (ref.current) {
            ref.current.position.copy(body.position)
            ref.current.quaternion.copy(body.quaternion)
        }
    })

    return [ref, body] as const
}

interface UseInstancedBodyParams extends BaseBodyOptions {
    instance: InstancedMesh
    index: number | null
    keepAround?: boolean
    scale?: Tuple3 | number
}

export function useInstancedBody({
    mass,
    position,
    rotation,
    keepAround = false,
    ready = true,
    scale = [1, 1, 1],
    instance,
    index,
    ...rest
}: UseInstancedBodyParams) {
    const [body] = useCannonBody({
        mass,
        position,
        rotation,
        ready,
        ...rest,
    })

    useEffect(() => {
        if (instance && typeof index === "number" && !keepAround) {
            return () => {
                setMatrixNullAt(instance, index)
            }
        }
    }, [instance, keepAround, index])

    useLayoutEffect(() => {
        if (instance && typeof index === "number" && ready) {
            setMatrixAt({
                index,
                instance,
                position,
                rotation,
                scale,
            })
        }
    }, [index, ready, instance])

    useFrame(() => {
        if (instance && typeof index === "number" && mass > 0 && ready) {
            setMatrixAt({
                index,
                instance,
                position: body.position.toArray(),
                rotation: body.quaternion.toArray(),
                scale
            })
        }
    })

    return [body, index] as const
}