// polyfill
import "../assets/styles/app.scss"

import { Workbox } from "workbox-window"
import React, { useEffect, useRef } from "react"
import { Box, Vec3, Sphere } from "cannon"
import ReactDOM from "react-dom"
import Config from "./data/Config"
import { useCannon } from "./data/cannon"
import { CannonProvider } from "./data/cannon"
import { Canvas, useThree, useFrame, extend } from "react-three-fiber"
import Path from "./components/Path"
import { useStore, api } from "./data/store"
 

function Camera() {
    let { camera, gl } = useThree()

    useEffect(() => {
        window.gl = gl

        return api.subscribe((position) => {
            camera.position.z = position.z - 5
            camera.position.y += (position.y + 6 - camera.position.y) * .05
            camera.position.x += (position.x + 5 - camera.position.x) * .05
        }, state => state.data.position)
    }, [])

    useEffect(() => {
        camera.position.set(5, 6, -5)
        camera.lookAt(0, 0, 0)
    }, [])

    return null
} 

function Player({
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

function Lights() {
    let ref = useRef()

    useEffect(() => {
        return api.subscribe((position) => {
            ref.current.position.z = position.z
            ref.current.position.y = position.y + 4
            ref.current.position.x = position.x
        }, state => state.data.position)
    }, [])

    return (
        <>
            <directionalLight
                color={0xffffff}
                position={[0, 5, 0]}
                intensity={.5}
                target-position={[3, -3, 5]}
            />
            <ambientLight color={0x99eeff} intensity={.3} />
            <pointLight ref={ref} color={0xFFFF00} intensity={1} distance={10} />
        </>
    )
}

ReactDOM.render(
    <>
        <Canvas
            orthographic
            noEvents 
            pixelRatio={1}
            camera={{
                zoom: 35,
                near: -50,
                far: 100,
                left: -50,
                right: 50
            }}
        >
            <CannonProvider defaultFriction={.8} defaultRestitution={.5}>
                <Lights />
                <Camera />
                <Path />
                <Player />
            </CannonProvider>
        </Canvas>
    </>,
    document.getElementById("root")
)

if (Config.REGISTER_SERVICEWORKER) {
    let worker = new Workbox("/serviceworker.js")

    worker.addEventListener("installed", e => {
        console.info(`Service worker ${e.isUpdate ? "updated" : "installed"}`)
    })
    worker.register()
}