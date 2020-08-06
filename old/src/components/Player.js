import React, { useEffect, useRef, useCallback, useState } from "react"
import { useSphere } from "use-cannon"
import { useFrame } from "react-three-fiber"
import { useStore } from "../data/store"
import GameState from "../data/const/GameState"

export default function Player() {
    let actions = useStore(state => state.actions)
    let state = useStore(state => state.data.state)
    let [ref, api] = useSphere(() => ({
        args: 1,
        mass: 1,
        position: [0, 10, 25],
        velocity: [0, 0, 0],
        type: "Dynamic"
    }))
    let velocity = useRef([0, 0, 0])
    let doJump = useRef(false)

    useEffect(() => {
         api.velocity.subscribe((v) => velocity.current = v) 
    }, [state])

    useEffect(() => { 
          api.position.subscribe((p) => {
            //console.log(p[2]) 

            if (state === GameState.RUNNING) {
                actions.setPosition(...p) 
            }
        }) 
    }, [state])

    useEffect(() => {
        window.addEventListener("click", () => {
            doJump.current = true
        })
    }, [])

    useFrame(() => {
        if (state === GameState.RUNNING) {
            api.velocity.set(velocity.current[0], doJump.current ? 7 : velocity.current[1], 4)
    
            doJump.current = false 
        }
    })

    return (

        <mesh ref={ref} >
            <meshLambertMaterial
                attach={"material"}
                args={[{
                    color: 0xfffff0,
                    flatShading: true, 
                    emissive: 0xfffff0,
                    emissiveIntensity: 10
                }]}
            />
            <sphereBufferGeometry
                attach="geometry"
                args={[1, 12, 6, 6]}
            />
        </mesh>
    )
}