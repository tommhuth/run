import React, { useEffect } from "react"
import { useStore } from "../data/store"
import { Vec3, Body, Plane } from "cannon"
import { useWorld } from "../data/cannon" 
import Block from "./Block" 
import GameState from "../data/const/GameState"

export default function Path() {
    let blocks = useStore(state => state.data.blocks)
    let state = useStore(state => state.data.state)
    let actions = useStore(state => state.actions) 
    let world = useWorld() 

    useEffect(() => {
        let edges = []
        let limit = 85

        for (let direction of [1, -1]) {
            let edge = new Body({
                shape: new Plane(),
                position: new Vec3(limit * direction, 0, 0),
                collisionFilterGroup: 8,
                collisionFilterMask: 2,
                mass: 0,
            })

            edge.addEventListener("collide", ({ body }) => {
                body.velocity.x = 0
                body.torque.set(0, 0, 0)
                body.force.set(0, 0, 0)
                body.angularVelocity.set(0, 0, 0)
            })

            edge.quaternion.setFromAxisAngle(new Vec3(0, 1, 0), Math.PI / 2 * -direction)
            world.add(edge)
        }

        return () => {
            edges.forEach(edge => world.remove(edge))
        }
    }, [])

    useEffect(() => {
        if (state === GameState.RUNNING) {
            let id = setInterval(() => actions.generatePath(), 1000)
    
            return () => clearInterval(id) 
        }
    }, [state]) 

    useEffect(() => {
         actions.generatePath() 
    }, []) 

    return (
        <>
            {blocks.map(i => {
                return <Block {...i} key={i.id} />
            })}
        </>
    )
}