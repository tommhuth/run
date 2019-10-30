import { World, NaiveBroadphase, Body } from "cannon"
import React, { useRef, useEffect, useState, useContext } from "react"
import { useFrame, useThree } from "react-three-fiber"
import Debug from "./debug"

const context = React.createContext()

export function CannonProvider({
    children,
    iterations = 9,
    defaultRestitution = 0,
    defaultFriction = .1,
    gravity = [0, -9.8, 0]
}) {
    let [world] = useState(() => new World())
    let { scene } = useThree()
    let [debug] = useState(() => new Debug(scene, world))

    useEffect(() => {
        world.broadphase = new NaiveBroadphase()
        world.solver.iterations = iterations
        world.defaultContactMaterial.friction = defaultFriction
        world.defaultContactMaterial.restitution = defaultRestitution
        world.gravity.set(...gravity)
    }, [world])

    // Run world stepper every frame
    useFrame(() => {
        world.step(1 / 30)
        //debug.update()
    })

    // Distribute world via context
    return <context.Provider value={world}>{children}</context.Provider>
}

export function useWorld() {
    return useContext(context)
}

// Custom hook to maintain a world physics body
export function useCannon({ mass, shape, position, cb = () => { } }, deps = []) {
    let ref = useRef()
    // Get cannon world object
    let world = useContext(context)
    // Instantiate a physics body
    let [body] = useState(() => new Body({ mass }))

    useEffect(() => {
        // Call function so the user can add shapes
        body.addShape(shape)
        body.position.set(...position)  

        // callback
        cb(body)

        // Add body to world on mount
        world.addBody(body)

        // Remove body on unmount
        return () => world.removeBody(body)
    }, deps)

    useFrame(() => {
        if (ref.current) {
            // Transport cannon physics into the referenced threejs object
            ref.current.position.copy(body.position)
            ref.current.quaternion.copy(body.quaternion)
        }
    })

    return ref
}