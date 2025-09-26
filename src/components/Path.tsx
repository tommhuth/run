import { addPathSection, useStore } from "@data/store"
import random from "@huth/random"
import { useFBO } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef } from "react"
import { Tuple3 } from "src/types/global"
import PathSection from "./PathSection"
import { Mesh, Vector3 } from "three"

let depthsize = 512
let i = 0

export default function Path() {
    let s = useStore(i => i.path)
    let t = useRef(0)
    let { gl, viewport } = useThree()
    const fbo = useFBO(
        Math.ceil(depthsize * gl.getPixelRatio()),
        Math.ceil(depthsize * gl.getPixelRatio() * (1 / viewport.aspect)),
        {
            stencilBuffer: false,
            depthBuffer: true, // this adds fbo.depthTexture
        }
    )

    useFrame(({ gl, scene, camera }) => {
        scene.traverse(i => {
            if (i.userData?.cloud) {
                i.visible = false
            }
        })

        gl.setRenderTarget(fbo)
        gl.render(scene, camera)
        gl.setRenderTarget(null)

        scene.traverse(i => {
            if (i.userData?.cloud) {
                i.visible = true
            }
        })
    })

    useFrame(({ camera }, delta) => {
        let front = s[0]
        let buffer = 25
        let intr = 250

        if (front && camera.position.z > front?.position[2] - buffer && t.current > intr) {
            let size: Tuple3 = [random.integer(4, 6), 20, random.integer(4, 8)]
            let position: Tuple3 = [
                random.integer(-1, 1) + Math.sin(i * .45) * 2,
                -10 + Math.sin(i * .4) * 3,
                front.position[2] + front.size[2] / 2 + size[2] / 2
            ]

            addPathSection(size, position)
            i++
            t.current = 0
        } else {
            t.current += delta * 1000
        }
    })

    let ref = useRef<Mesh>(null)

    useFrame(({ camera }) => {
        let dist = 2
        const forward = new Vector3(0, 0, 1).applyQuaternion(camera.quaternion)

        ref.current.position.copy(camera.position).add(forward.multiplyScalar(dist))

        ref.current?.quaternion.copy(camera.quaternion)

    })

    return (
        <>
            <mesh ref={ref}>
                <boxGeometry args={[2, 2, .1]} />
                <meshBasicMaterial color="yellow" />
            </mesh>
            {s.map(i => {
                return (
                    <PathSection depthTexture={fbo.depthTexture} {...i} key={i.id} />
                )
            })}
        </>
    )
}