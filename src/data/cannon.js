import { World, Body, Vec3 } from "cannon"
import React, { useRef, useEffect, useState, useContext, useLayoutEffect } from "react"
import { useFrame } from "react-three-fiber"

const context = React.createContext()

export function CannonProvider({
    children,
    iterations = 3,
    defaultRestitution = 0,
    defaultFriction = .1,
    gravity = [0, -10, 0]
}) {
    let [world] = useState(() => new World())

    useEffect(() => {
        world.solver.iterations = iterations
        world.defaultContactMaterial.friction = defaultFriction
        world.defaultContactMaterial.restitution = defaultRestitution
        world.gravity.set(...gravity)
    }, [world])

    // Run world stepper every frame
    useFrame((state, delta) => { 
        //document.getElementById("testy").innerText = delta.toFixed(5)
        world.step(delta * 2)
    }) 

    // Distribute world via context
    return <context.Provider value={world}>{children}</context.Provider>
}

export function useWorld() {
    return useContext(context)
}

// Custom hook to maintain a world physics body
export function useCannon({
    mass = 0,
    shape,
    customData = {},
    position = [0, 0, 0],
    velocity = [0, 0, 0],
    collisionFilterGroup,
    collisionFilterMask,
    onCollide
}, deps = []) {
    let ref = useRef()
    let world = useContext(context)
    let [body] = useState(() => new Body({
        mass,
        shape,
        position: new Vec3(...position),
        velocity: new Vec3(...velocity),
        collisionFilterGroup,
        collisionFilterMask
    }))

    useEffect(() => {
        body.customData = customData

        if (onCollide) {
            body.addEventListener("collide", onCollide)

            return () => {
                body.removeEventListener("collide", onCollide)
            }
        }
    }, deps)

    useLayoutEffect(() => {
        if (ref.current) {
            ref.current.position.copy(body.position)
            ref.current.quaternion.copy(body.quaternion)
            ref.current.updateMatrix()
        }

        world.addBody(body)

        return () => world.removeBody(body)
    }, [body])

    useFrame(() => {
        if (ref.current) {
            ref.current.position.copy(body.position)
            ref.current.quaternion.copy(body.quaternion)
        }
    })

    return { ref, body }
}