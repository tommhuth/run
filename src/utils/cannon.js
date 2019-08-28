import { World, NaiveBroadphase, Body } from "cannon"
import React, { useRef, useEffect, useState, useContext } from "react"
import { useRender, useThree } from "react-three-fiber"
//import CannonDebugRenderer from "../../assets/addons/CannonDebugRenderer"

const context = React.createContext()

export function CannonProvider({
    children,
    iterations = 8,
    defaultRestitution = 0,
    defaultFriction = 0,
    gravity = [0, -9.8, 0]
}) {
    const [world] = useState(() => new World())
    const [debug, setDebug] = useState(null)
    const { scene } = useThree()

    useEffect(() => {
        world.broadphase = new NaiveBroadphase()
        world.solver.iterations = iterations
        world.defaultContactMaterial.friction = defaultFriction
        world.defaultContactMaterial.restitution = defaultRestitution
        world.gravity.set(...gravity)

        //setDebug(new CannonDebugRenderer(scene, world)) 
    }, [])

    // Run world stepper every frame
    useRender(() => {
        world.step(1 / 30)
        //debug.update()

    }, false, [debug, world])

    // Distribute world via context
    return <context.Provider value={world} children={children} />
}

export function useWorld() {
    return useContext(context)
}

export function getPlayer(world) {
    return world.bodies.find(i => i.userData && i.userData.type === "player")
}

// Custom hook to maintain a world physics body
export function useCannon({ ...props }, fn, deps = []) {
    const ref = useRef() 
    const world = useContext(context) 
    const [body] = useState(() => new Body(props))

    useEffect(() => {
        if (props.mass !== null) {
            // Call function so the user can add shapes
            fn(body, world)

            // Add body to world on mount
            world.addBody(body)

            // Remove body on unmount
            return () => {
                world.removeBody(body)
            }
        }
    }, deps)

    useRender(() => {
        if (ref.current && props.mass !== null) {
            // Transport cannon physics into the referenced threejs object
            ref.current.position.copy(body.position)
            ref.current.quaternion.copy(body.quaternion)
        }
    })

    return ref
}
