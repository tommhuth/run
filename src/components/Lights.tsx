import { useStore } from "@data/store"
import { useThree, useFrame } from "@react-three/fiber"
import { useRef, useEffect } from "react"
import { DirectionalLight } from "three"

export default function Lights() {
    let shadowLightRef = useRef<DirectionalLight>(null)
    let { scene, viewport } = useThree()
    let time = useRef(0)
    let forwardOffset = 10
    let targetPosition = [10, -20, 6]

    useEffect(() => {
        if (!shadowLightRef.current) {
            return
        }

        // scene.add(new CameraHelper(shadowLightRef.current.shadow.camera))
        scene.add(shadowLightRef.current.target)
    }, [scene])


    useFrame((_, delta) => {
        let { player, state } = useStore.getState()

        // update camera shadow position every 1s
        if (shadowLightRef.current && time.current >= 1000 && player.mesh && state === "running") {
            let z = player.mesh.position.z + forwardOffset

            shadowLightRef.current.position.z = z
            shadowLightRef.current.target.position.z = z + targetPosition[2]
            time.current = 0
        } else {
            time.current += delta * 1000
        }
    })

    return (
        <>
            <directionalLight
                position={[0, 0, 0]}
                target-position={targetPosition}
                castShadow
                ref={shadowLightRef}
                intensity={2}
                shadow-mapSize={[512 * viewport.dpr, 512 * viewport.dpr]}
                shadow-camera-near={-10} // z
                shadow-camera-far={20}
                shadow-camera-left={-15} // x back/forwards
                shadow-camera-right={20}
                shadow-camera-top={15} // y
                shadow-camera-bottom={-10}
                shadow-radius={5}
                shadow-normalBias={.01}
                shadow-bias={.0001} // 0.0001
                shadow-blurSamples={8} //8
            />
            <ambientLight intensity={.25} color={"rgb(0, 136, 255)"} />
            <ambientLight intensity={.1} color={"white"} />
        </>
    )
}
