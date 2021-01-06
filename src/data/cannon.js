import { World, Body, Vec3 } from "cannon-es"
import React, { useRef, useEffect, useState, useContext, useMemo, useLayoutEffect } from "react"
import { useFrame, useThree } from "react-three-fiber"
import CannonDebugRenderer from "./CannonDebugRenderer"

const context = React.createContext()
const defaultGravity = [0, -10, 0]

export function CannonProvider({
    children,
    iterations = 6,
    defaultRestitution = 0.2,
    fps = 30,
    debug = false,
    defaultFriction = 0.1,
    gravity = defaultGravity
}) {
    let { scene } = useThree()
    let [world] = useState(() => new World())
    let debugRenderer = useMemo(() => new CannonDebugRenderer(scene, world), [])

    useEffect(() => {
        world.allowSleep = false
        world.quatNormalizeFast = false
        world.quatNormalizeSkip = 0
        world.solver.iterations = iterations
        world.defaultContactMaterial.friction = defaultFriction
        world.defaultContactMaterial.restitution = defaultRestitution
        world.gravity.set(...gravity)
    }, [defaultFriction, defaultRestitution, gravity, iterations, world])

    useFrame((state, delta) => {
        try {
            world.step(delta >= 1 / 30 ? 1 / (fps / 2) : 1 / fps)

            if (debug) {
                debugRenderer.update()
            }
        } catch (e) {
            // log failed step
            console.error(e)
        }
    })

    // Distribute world via context
    return <context.Provider value={world}>{children}</context.Provider>
}

export function useWorld() {
    return useContext(context)
}

// Custom hook to maintain a world physics body
export function useCannon(
    {
        mass = 0,
        shape,
        userData = {},
        position = [0, 0, 0],
        velocity = [0, 0, 0],
        rotation = [0, 0, 0],
        linearFactor = [1, 1, 1],
        angularFactor = [1, 1, 1],
        linearDamping = 0.1,
        createShape,
        angularDamping = 0.1,
        collisionFilterGroup,
        collisionFilterMask,
        createContactMaterial,
        onCollide = () => { },
        onPreStep = () => { },
        onPostStep = () => { },
        material,
    },
    deps = []
) {
    let ref = useRef()
    let world = useContext(context)
    let body = useMemo(() => {
        let body = new Body({
            mass,
            shape,
            position: new Vec3(...position),
            velocity: new Vec3(...velocity),
            linearFactor: new Vec3(...linearFactor),
            angularFactor: new Vec3(...angularFactor),
            linearDamping,
            angularDamping,
            sleepSpeedLimit: 0.05,
            sleepTimeLimit: 2,
            allowSleep: true,
            collisionFilterGroup,
            collisionFilterMask,
            material: material || world.defaultMaterial,
        })

        return body
    }, [])

    useEffect(() => {
        body.userData = userData

        if (createContactMaterial) {
            let cm = createContactMaterial()

            world.addContactMaterial(cm)

            return () => (world.contactmaterials = world.contactmaterials.filter((i) => i !== cm))
        }
    }, [])

    useEffect(() => {
        body.addEventListener("collide", onCollide)

        return () => body.removeEventListener("collide", onCollide)
    }, deps)

    useEffect(() => {
        let pre = () => onPreStep(body)
        let post = () => onPostStep(body)

        world.addEventListener("preStep", pre)
        world.addEventListener("postStep", post)

        return () => {
            world.removeEventListener("preStep", pre)
            world.removeEventListener("postStep", post)
        }
    }, deps)

    useLayoutEffect(() => {
        let axis = new Vec3(...rotation.map((i) => (i === 0 ? 0 : 1)))
        let angle = rotation.find((i) => i) || 0

        body.quaternion.setFromAxisAngle(axis, angle)

        //ref.current.position.copy(body.position)
        //ref.current.quaternion.copy(body.quaternion)
        //ref.current.matrixAutoUpdate = mass > 0
        ref.current.updateMatrix()
    }, [])

    useEffect(() => {
        if (!shape && body.shapes.length === 0) {
            createShape(body)  
        }

        world.addBody(body)

        return () => world.removeBody(body)
    }, [body, createShape, shape, world])

    useFrame(() => {
        if (ref.current) {
            ref.current.position.copy(body.position)
            ref.current.quaternion.copy(body.quaternion)
        }
    })

    return { ref, body }
}