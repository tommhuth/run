import { World, Body, Vec3 } from "cannon"
import React, { useRef, useEffect, useState, useContext } from "react"
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
    active = false,
    customData = {},
    position = [0, 0, 0],
    velocity = [0, 0, 0],
    collisionFilterGroup,
    collisionFilterMask
}, deps = []) {
    let ref = useRef()
    // Get cannon world object
    let world = useContext(context)
    // Instantiate a physics body
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
    }, deps)

    useEffect(()=> { 
        ref.current.position.copy(body.position)
        ref.current.quaternion.copy(body.quaternion)
        ref.current.matrixAutoUpdate = mass > 0
        ref.current.updateMatrix()
    }, [])

    useEffect(() => {  
        if (active) {
            // Add body to world on mount
            world.addBody(body) 

            // Remove body on unmount
            return () => world.removeBody(body)
        } else {
            world.removeBody(body)
        }
    }, [active, body])

    useFrame(() => {
        if (ref.current && mass > 0) {
            // Transport cannon physics into the referenced threejs object
            ref.current.position.copy(body.position)
            ref.current.quaternion.copy(body.quaternion)
        } 
    })

    return { ref, body }
}