import React, { useEffect } from "react"
import { Sphere } from "cannon"
import { useCannon } from "../data/cannon"
import { useFrame } from "react-three-fiber"
import { useStore } from "../data/store"

export default function Player({
    speed = 4
}) {
    let actions = useStore(state => state.actions)
    let { ref, body } = useCannon({
        shape: new Sphere(1),
        collisionFilterGroup: 2,
        collisionFilterMask: 1 | 2 | 4 | 8,
        active: true,
        mass: 1,
        position: [0, 3, 0]
    })

    useFrame(() => {
        body.velocity.z = speed

        actions.setPosition(body.position.x, body.position.y, body.position.z)
    })

    useEffect(() => {
        let onClick = () => {
            body.velocity.y = speed * 2.5
        }
        let onMouseMove = (e) => {
            let v = (e.clientX - (window.innerWidth / 2)) / (window.innerWidth / 2)

            body.velocity.x = v * -speed * 3
        }

        window.addEventListener("click", onClick)
        window.addEventListener("mousemove", onMouseMove)

        return () => {
            window.removeEventListener("click", onClick)
            window.removeEventListener("mousemove", onMouseMove)
        }
    }, [body, speed])

    return (
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
    )
}