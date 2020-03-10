import React, { useEffect, useRef } from "react"
import { Sphere } from "cannon"
import { useCannon } from "../data/cannon"
import { useFrame, Dom } from "react-three-fiber"
import { useStore } from "../data/store"
import GameState from "../data/const/GameState"

export default function Player({
    speed = 4
}) {
    let state = useStore(state => state.data.state)
    let hasDeviceOrientation = useStore(state => state.data.hasDeviceOrientation)
    let actions = useStore(state => state.actions)
    let { ref, body } = useCannon({
        shape: new Sphere(1),
        collisionFilterGroup: 2,
        collisionFilterMask: 1 | 2 | 4 | 8,
        active: true,
        mass: 1,
        position: [0, 3, 0]
    })
    let frames = useRef(0)

    useFrame(() => {
        if (state === GameState.RUNNING) {
            if (body.velocity.z < .5 && frames.current > 3) {
                actions.end()
            }

            body.velocity.z = speed 
            frames.current++
            actions.setPosition(body.position.x, body.position.y, body.position.z)
        } 
    })

    useEffect(() => {
        let onClick = (e) => {
            e.preventDefault()

            if (state !== GameState.RUNNING) {
                return
            }

            body.velocity.y = speed * 2.5
        }
        let onMouseMove = (e) => {
            if (state !== GameState.RUNNING) {
                return
            }

            let v = (e.clientX - (window.innerWidth / 2)) / (window.innerWidth / 2)

            body.velocity.x = v * -speed * 3
        }
        let onDeviceOrientation = e => {
            if (state !== GameState.RUNNING) {
                return
            }
            
            let max = speed * 3
            let velocity = -e.gamma / 50 * max

            body.velocity.x = velocity
        }

        window.addEventListener("click", onClick)
        window.addEventListener("mousemove", onMouseMove)

        if (hasDeviceOrientation) {
            window.addEventListener("deviceorientation", onDeviceOrientation)
        } 

        return () => {
            window.removeEventListener("click", onClick)
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("deviceorientation", onDeviceOrientation)
        }
    }, [body, speed, state])

    return (
        <> 
            <mesh ref={ref}>
                <meshPhongMaterial
                    attach={"material"}
                    args={[{ color: 0xfffb1f, transparent: true, opacity: .65, flatShading: true, emissive: 0xfffb1f, emissiveIntensity: .6 }]}
                />
                <sphereBufferGeometry
                    attach="geometry"
                    args={[1, 12, 6, 6]}
                />
            </mesh>
        </>
    )
}