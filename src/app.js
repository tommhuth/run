import "../assets/styles/app.scss"

import ReactDOM from "react-dom"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader" 
import { Canvas, useFrame, useThree } from "@react-three/fiber" 

import { BufferGeometry, DoubleSide, Matrix4, Quaternion, Vector3 } from "three"
import animate from "@huth/animate"
import { Physics, Debug, useSphere, useBox } from "@react-three/cannon"
import { useEffect, createContext, useContext, useMemo, useRef, useLayoutEffect, useState } from "react"
import useStore, { generatePath, setPlayerPosition, setState } from "./data/store"


const context = createContext()

export function ModelsProvider({ children }) {
    let [ref, boxApi] = useBox(() => ({ mass: 0, args: [20, 50, 8], position: [0, 0, -1000] }))


    return (
        <context.Provider value={{ box: [boxApi, ref] }}>
            <instancedMesh
                receiveShadow
                castShadow
                userData={{ ground: true }}
                ref={ref}
                args={[undefined, undefined, 20]}
            >
                <boxBufferGeometry args={[20, 50, 8, 1, 1, 1]} />
                <meshPhongMaterial />
            </instancedMesh>
            {children}
        </context.Provider>
    )
}

let i = 0

export function useModel(type) {
    let [api, ref] = useContext(context)[type]
    let index = useMemo(() => (i++) % 20, [])
    let model = useMemo(() => {

        return api.at(index)
    }, [api, index])

    return model
}

function App() {

    return (
        <>
            <div
                style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    zIndex: 1000
                }}
                id="debug"
            >

            </div>
            <Canvas
                orthographic
                dpr={1}
                camera={{
                    zoom: 50, // 24,
                    near: -25,
                    far: 100
                }}
                linear
                colorManagement
                shadows
                gl={{
                    antialias: true,
                    depth: true,
                    stencil: true,
                    alpha: false
                }}
            >
                <color attach="background" args={["yellow"]} />


                <Camera />
                <Lights />

                <Physics
                    gravity={[0, -30, 0]}
                    broadphase="SAP"
                    defaultContactMaterial={{
                        restitution: .35
                    }}
                    axisIndex={2}
                >
                    <ModelsProvider>
                        <Player />
                        <Path />
                    </ModelsProvider>
                </Physics>
            </Canvas>
        </>
    )
}

function Lights() {
    let ref = useRef()
    let position = useRef([0, 0, 0])
    let state = useStore(i => i.state)
    let { scene } = useThree()

    useEffect(() => {
        return useStore.subscribe(i => position.current = i, state => state.player.position)
    }, [])

    useLayoutEffect(() => {
        ref.current.shadow.mapSize.set(256, 256)
        ref.current.shadow.camera.near = -40
        ref.current.shadow.camera.far = 40
        ref.current.shadow.camera.left = -20
        ref.current.shadow.camera.right = 20
        ref.current.shadow.camera.top = 20
        ref.current.shadow.camera.bottom = -20
        ref.current.shadow.normalBias = .006

        ref.current.target.position.set(-7, -12, -15)
        scene.add(ref.current.target)
    }, [])

    useFrame(() => {
        if (state === "running") {
            ref.current.position.x = Math.floor(position.current[0])
            ref.current.target.position.x = Math.floor(position.current[0]) - 7

            ref.current.position.z = Math.floor(position.current[2])
            ref.current.target.position.z = Math.floor(position.current[2]) + 15

            ref.current.position.y = Math.floor(position.current[1])
            ref.current.target.position.y = Math.floor(position.current[1]) - 12
        }
    })

    return (
        <>
            <directionalLight
                ref={ref}
                color={0xaaaaff}
                position={[0, 0, 0]}
                intensity={.31}
                castShadow
                onUpdate={self => {
                    self.updateMatrixWorld()
                }}
            />
            <hemisphereLight groundColor="red" color="blue" intensity={.9} />
        </>
    )
}

let loader = new GLTFLoader()

function Block({ x = 0, y = 0, start, depth }) {
    let block = useModel("box")
    let z = start + depth / 2
    let [geometry, setGeometry] = useState(new BufferGeometry())

    useEffect(() => {
        loader.load(`/models/grass.glb`, ({ scene }) => {
            console.log(scene.children[0])
            setGeometry(scene.children[0].geometry)
        })
    }, [])

    useEffect(() => {
        block.position.set(x, y - 50, z)
    }, [block, x, y, z])

    useEffect(() => {
        animate({
            from: y - 50,
            to: y - 25,
            easing: "easeOutQuint",
            render(y) {
                block.position.set(x, y, z)
            }
        })
    }, [x, y, z, block])

    return null

    /*
    return (
        <mesh args={[geometry]} position={[x,y ,z]}>
            <meshPhongMaterial color="red" side={DoubleSide} />
        </mesh>
    )
    */
}



function Player() {
    let radius = .75
    let [ref, api] = useSphere(() => ({
        mass: 2,
        type: "Dynamic",
        args: radius,
        position: [0, 4, 0],
        onCollideBegin(e) {
            if (e.body.userData?.ground) {
                canJump.current = true
            }
        }
    }))
    let speed = 8
    let jumpForce = 12
    let velocity = useRef([0, 0, 0])
    let xvelocity = useRef(0)
    let velocityHistory = useRef([])
    let canJump = useRef(false)
    let controls = useRef({ jump: false })
    let state = useStore(i => i.state)

    useEffect(() => {
        window.addEventListener("mousedown", () => {
            controls.current.jump = true
        })

        window.addEventListener("mousemove", e => {
            let x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2)

            xvelocity.current = -x * 5
        })
    }, [])

    useEffect(() => {
        return api.velocity.subscribe(v => {
            velocity.current = v
            velocityHistory.current = ([v[2], ...velocityHistory.current.slice(0, 1)])
        })
    }, [api])

    useEffect(() => {
        return api.position.subscribe(position => setPlayerPosition(position))
    }, [api])

    useFrame(() => {
        if (state === "running") {
            api.velocity.set(
                xvelocity.current,
                Math.min(velocity.current[1] + (canJump.current && controls.current.jump ? jumpForce : 0), jumpForce),
                speed
            )

            if (controls.current.jump) {
                canJump.current = false
                controls.current.jump = false
            }
        }
    })

    useFrame(() => {
        if (state === "running") {
            let averageSpeed = velocityHistory.current.reduce(
                (previous, current) => previous + current,
                0
            ) / velocityHistory.current.length

            if (averageSpeed < speed * .5) {
                setState("dead")
            }
        }
    })

    return (
        <mesh ref={ref} castShadow>
            <sphereBufferGeometry args={[radius, 16, 16]} />
            <meshPhongMaterial color="yellow" />
        </mesh>
    )
}

function Path() {
    let path = useStore(i => i.path)

    useEffect(() => {
        setInterval(generatePath, 500)
    }, [])

    return (
        <>
            {path.map(i => <Block key={i.id} {...i} />)}
        </>
    )
}

function Camera() {
    let { camera } = useThree()
    let position = useRef([0, 0, 0])
    let state = useStore(i => i.state)

    useFrame(({ gl }) => {
        document.getElementById("debug").innerText = gl.info.render.calls

        if (state === "running") {
            camera.position.x += (position.current[0] + 5 - camera.position.x) * .05
            camera.position.y += (position.current[1] + 5 - camera.position.y) * .01
            camera.position.z += (position.current[2] - camera.position.z) * .1
        }
    })

    useLayoutEffect(() => {
        camera.position.set(5, 5, -5)
        camera.lookAt(0, 0, 0)
    }, [])

    useEffect(() => {
        return useStore.subscribe(i => position.current = i, state => state.player.position)
    }, [])

    return null
}


ReactDOM.render(<App />, document.getElementById("root"))