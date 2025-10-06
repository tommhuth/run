import { useStore } from "@data/store"
import { useFrame,useThree } from "@react-three/fiber"
import { useEffect,useRef } from "react"
import { DirectionalLight } from "three"

export default function Lights() {
    const shadowLightRef = useRef<DirectionalLight>(null)
    const { scene, viewport } = useThree()
    const time = useRef(0)
    const forwardOffset = 10
    const targetPosition = [10, -20, 6]

    useEffect(() => {
        if (!shadowLightRef.current) {
            return
        }

        //scene.add(new CameraHelper(shadowLightRef.current.shadow.camera))
        scene.add(shadowLightRef.current.target)
    }, [scene])


    useFrame((_, delta) => {
        const { player, state } = useStore.getState()

        // update camera shadow position 
        if (shadowLightRef.current && time.current >= 750 && player.mesh && state === "running") {
            const z = player.mesh.position.z + forwardOffset

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
                shadow-camera-far={25}
                shadow-camera-left={-20} // x back/forwards
                shadow-camera-right={25}
                shadow-camera-top={20} // y
                shadow-camera-bottom={-20}
                shadow-radius={2}
                shadow-blurSamples={8} //8
            />
            <ambientLight intensity={.25} color={"rgb(0, 136, 255)"} />
            <ambientLight intensity={.1} color={"white"} />
        </>
    )
}
