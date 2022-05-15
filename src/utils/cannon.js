import { GSSolver, SplitSolver, World, Body, Vec3, SAPBroadphase } from "cannon-es"
import React, { useRef, useEffect, useContext, useMemo, useLayoutEffect, useCallback } from "react"
import { useFrame } from "@react-three/fiber"
import { Color, Matrix4, Quaternion, Vector3 } from "three"

const context = React.createContext()

export function CannonProvider({
    children,
    allowSleep = true,
    gravity: [gravityX, gravityY, gravityZ] = [0, -20, 0],
    defaultRestitution = .2,
    axisIndex,
    iterations = 6,
    step = 1 / 60
}) {
    let world = useMemo(() => {
        return new World({
            allowSleep,
            gravity: new Vec3(gravityX, gravityY, gravityZ)
        })
    }, [allowSleep, gravityX, gravityY, gravityZ])

    useEffect(() => {
        if (axisIndex) {
            world.broadphase = new SAPBroadphase(world)
            world.broadphase.axisIndex = axisIndex
        }

        world.solver = new SplitSolver(new GSSolver())
        world.solver.iterations = iterations
        world.solver.tolerance = .01
        world.defaultContactMaterial.restitution = defaultRestitution
    }, [world, axisIndex, iterations, defaultRestitution])

    useFrame(() => {
        world.step(step)
    })

    return (
        <context.Provider value={world}>
            {children}
        </context.Provider>
    )
}

export function useCannonWorld() {
    return useContext(context)
}


function useCannonBody({
    definition,
    mass = 0,
    position: [positionX, positionY, positionZ] = [0, 0, 0],
    rotation: [rotationX, rotationY, rotationZ] = [0, 0, 0],
    linearDamping = 0,
    allowSleep = true,
}) {
    let body = useMemo(() => new Body({
        mass,
        allowSleep,
        sleepSpeedLimit: .001,
        linearDamping,
        position: new Vec3(positionX, positionY, positionZ)
    }), [linearDamping, allowSleep, mass, positionX, positionY, positionZ])
    let world = useCannonWorld()

    useEffect(() => {
        if (Array.isArray(definition)) {
            for (let shapeDefinition of definition) {
                body.addShape(...shapeDefinition)
            }
        } else {
            body.addShape(definition)
        }
    }, [body, definition])

    useLayoutEffect(() => {
        body.quaternion.setFromEuler(rotationX, rotationY, rotationZ)
    }, [body, rotationX, rotationY, rotationZ])

    useEffect(() => {
        world.addBody(body) 

        return () => {
            world.removeBody(body)
        }
    }, [body, world])

    return [body, world]
}

export function useBody({
    mass = 1,
    position: [positionX, positionY, positionZ] = [0, 0, 0],
    rotation: [rotationX, rotationY, rotationZ] = [0, 0, 0],
    definition, 
    linearDamping = .0,
    allowSleep = true,
}) {
    let ref = useRef()
    let [body] = useCannonBody({
        mass,
        definition,
        position: [positionX, positionY, positionZ],
        rotation: [rotationX, rotationY, rotationZ],
        linearDamping,
        allowSleep
    })

    useFrame(() => {
        if (ref.current && mass > 0) {
            ref.current.position.set(body.position.x, body.position.y, body.position.z)
            ref.current.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)
        }
    })

    return [ref, body]
}


let _matrix = new Matrix4()
let _rotation = new Quaternion()
let _position = new Vector3(0, 0, 0)
let _scale = new Vector3(1, 1, 1)
let _color = new Color()

export function useInstancedBody({
    mass = 0,
    position: [positionX, positionY, positionZ] = [0, 0, 0],
    rotation: [rotationX, rotationY, rotationZ] = [0, 0, 0],
    color,
    id, 
    definition,
    scale: [scaleX, scaleY, scaleZ] = [1, 1, 1],
    instance,
    linearDamping = .1
}) {
    let [body] = useCannonBody({
        mass,
        definition,
        position: [positionX, positionY, positionZ],
        rotation: [rotationX, rotationY, rotationZ],
        linearDamping,
    })
    let setMatrix = useCallback(() => {
        if (typeof id === "number") {
            instance.setMatrixAt(id, _matrix.compose(
                _position.set(body.position.x, body.position.y, body.position.z),
                _rotation.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w),
                _scale.set(scaleX, scaleY, scaleZ)
            ))
            instance.instanceMatrix.needsUpdate = true
        }
    }, [body, id, instance, scaleX, scaleY, scaleZ])

    useEffect(() => {
        if (instance && id) {
            return () => {
                // move offscreen when unmounted
                instance.setMatrixAt(id, _matrix.compose(
                    _position.set(-100000, 0, -100000),
                    _rotation.set(0, 0, 0, 0),
                    _scale.set(1, 1, 1)
                ))
                instance.instanceMatrix.needsUpdate = true
            }
        }
    }, [instance, id])

    useLayoutEffect(() => {
        if (instance && id) {
            setMatrix()
        }
    }, [setMatrix, id, instance])

    useLayoutEffect(() => {
        if (instance && id && color) {
            instance.setColorAt(id, _color.set(color))
            instance.instanceColor.needsUpdate = true
        }
    }, [color, id, instance])

    useFrame(() => {
        if (instance ) {
            setMatrix()
        }
    })

    return [body, id]
}