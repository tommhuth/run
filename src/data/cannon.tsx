import { setMatrixAt, setMatrixNullAt } from "@components/materials/helpers"
import { useFrame, useThree } from "@react-three/fiber"
import {
    Body as CannonBody,
    ContactEquation,
    ContactMaterial,
    GSSolver,
    Material,
    Quaternion as CannonQuaternion,
    Quaternion,
    SAPBroadphase,
    Shape,
    SplitSolver,
    Vec3,
    World
} from "cannon-es"
import createCannonDebugger from "cannon-es-debugger"
import React, { ReactNode, useContext, useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { Tuple3 } from "src/types/global"
import { InstancedMesh, Mesh } from "three"

import Config from "./Config"
import { setState } from "./store/actions/actions"
import { useStore } from "./store/store"

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
    active?: boolean
    collisionResponse?: boolean
}

const context = React.createContext<World | null>(null)

export type CollisionEvent = { body: Body, target: Body, contact: ContactEquation }

export function resetBody(
    body: CannonBody,
    x: number,
    y: number,
    z: number,
    quaternion: Quaternion
) {
    body.position.set(x, y, z)
    body.previousPosition.set(x, y, z)
    body.interpolatedPosition.set(x, y, z)
    body.initPosition.set(x, y, z)

    body.quaternion.copy(quaternion)
    body.previousQuaternion.copy(quaternion)
    body.interpolatedQuaternion.copy(quaternion)
    body.initQuaternion.copy(quaternion)

    body.velocity.setZero()
    body.initVelocity.setZero()
    body.angularVelocity.setZero()
    body.initAngularVelocity.setZero()
    body.force.setZero()
    body.torque.setZero()

    body.aabbNeedsUpdate = true
    body.wakeUp()
}

export class Body<T = unknown> extends CannonBody {
    userData: Record<string, T> = {}
}

export function useCannonWorld() {
    const world = useContext(context)

    if (!world) {
        throw new Error("Missing world context")
    }

    const materials = useMemo(() => {
        return {
            wheel: new Material()
        }
    }, [])
    const contactMaterials = useMemo(() => {
        return {
            wheelGround: new ContactMaterial(materials.wheel, world.defaultMaterial, {
                friction: 0.3,
                restitution: 0,
                contactEquationStiffness: 1000,
            })
        }
    }, [])

    useEffect(() => {
        Object.entries(contactMaterials).map(i => world.addContactMaterial(i[1]))
    }, [])

    return { world, materials, contactMaterials }
}

export const DEFAULT_RESTITUTION = .1
export const DEFAULT_ITERATIONS = 6
export const DEFAULT_GRAVITY: Tuple3 = [0, -9.8, 0]

function useCannonBody({
    definition,
    mass,
    position: [x, y, z] = [0, 0, 0],
    rotation = [0, 0, 0],
    linearDamping,
    angularDamping,
    velocity = [0, 0, 0],
    userData = {},
    allowSleep = true,
    active = true,
    ...rest
}: BaseBodyOptions) {
    const { world } = useCannonWorld()
    const body = useMemo(() => {
        return new Body({
            mass,
            allowSleep,
            sleepSpeedLimit: .1,
            position: new Vec3(x, y, z),
            velocity: new Vec3(...velocity),
            quaternion: new CannonQuaternion().setFromEuler(...rotation),
            angularDamping,
            linearDamping,
            ...rest
        })
    }, [rest.collisionResponse])

    useLayoutEffect(() => {
        body.position.set(x, y, z)
    }, [x, y, z, body])

    useLayoutEffect(() => {
        body.quaternion.setFromEuler(...rotation)
    }, [...rotation, body])

    useLayoutEffect(() => {
        body.shapes = []

        if (Array.isArray(definition)) {
            for (const shapeDefinition of definition) {
                body.addShape(...shapeDefinition)
            }
        } else {
            body.addShape(definition)
        }
    }, [body, definition])

    useEffect(() => {
        if (!active) {
            return
        }

        world.addBody(body)

        return () => {
            world.removeBody(body)
        }
    }, [body, world, active])

    useEffect(() => {
        body.userData = userData
    }, [userData, body])

    return [body] as const
}

interface CannonProviderProps {
    gravity?: Tuple3
    defaultRestitution?: number
    iterations?: number
    debug?: boolean
    children: ReactNode
    allowSleep?: boolean
}

export function CannonProvider({
    children,
    gravity = DEFAULT_GRAVITY,
    defaultRestitution = DEFAULT_RESTITUTION,
    iterations = DEFAULT_ITERATIONS,
    debug = false,
    allowSleep = true,
}: CannonProviderProps) {
    const { scene } = useThree()
    const world = useMemo(() => {
        const solver = new SplitSolver(new GSSolver())

        solver.iterations = iterations

        const world = new World({
            solver,
            allowSleep,
            gravity: new Vec3(...gravity),
            quatNormalizeFast: false,
            quatNormalizeSkip: 0,
        })

        const sap = new SAPBroadphase(world)

        sap.axisIndex = 2

        world.broadphase = sap
        world.defaultContactMaterial.restitution = defaultRestitution

        return world
    }, [iterations, ...gravity])
    const cannonDebugger = useMemo(() => {
        return debug ? createCannonDebugger(scene, world, { color: "red" }) : null
    }, [world, scene, debug])

    useFrame(() => {
        const { loading, debug } = useStore.getState()
        const time = performance.now()

        if (loading) {
            return
        }

        // simulation independently of framerate every 1 / 60 ms
        world.fixedStep()

        if (Config.DEBUG) {
            const physicsTime = performance.now() - time

            setState({
                debug: {
                    ...debug,
                    physicsTime,
                    bodies: world.bodies.length
                }
            })
        }

        if (world.hasActiveBodies && cannonDebugger) {
            cannonDebugger.update()
        }
    }, -1)

    return (
        <context.Provider value={world}>
            {children}
        </context.Provider>
    )
}

export function useBody({
    mass,
    active = true,
    ...rest
}: BaseBodyOptions) {
    const ref = useRef<Mesh>(null)
    const [body] = useCannonBody({ mass, active, ...rest })

    useLayoutEffect(() => {
        if (ref.current && active) {
            ref.current.position.copy(body.position)
            ref.current.quaternion.copy(body.quaternion)
        }
    }, [active])

    useFrame(() => {
        if (ref.current && active) {
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
    active = true,
    scale = [1, 1, 1],
    instance,
    index,
    ...rest
}: UseInstancedBodyParams) {
    const [body] = useCannonBody({
        mass,
        position,
        rotation,
        active,
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
        if (instance && typeof index === "number" && active) {
            setMatrixAt({
                index,
                instance,
                position,
                rotation,
                scale,
            })
        }
    }, [index, active, instance])

    useFrame(() => {
        if (instance && typeof index === "number" && mass > 0 && active) {
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
