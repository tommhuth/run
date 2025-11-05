import { useStore } from "@data/store"
import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { CameraHelper, DirectionalLight } from "three"

export default function Lights() {
    const shadowLightRef = useRef<DirectionalLight>(null)
    const { scene, viewport } = useThree()
    const time = useRef(0)
    const forwardOffset = 10
    const targetPosition = [15, -20, 6]

    useEffect(() => {
        if (!shadowLightRef.current) {
            return
        }

        //scene.add(new CameraHelper(shadowLightRef.current.shadow.camera))
        scene.add(shadowLightRef.current.target)
    }, [scene])

    useFrame((_, delta) => {
        const { player: { vehicle }, state } = useStore.getState()

        // update camera shadow position 
        if (shadowLightRef.current && time.current >= 750 && vehicle) {
            const z = vehicle.chassisBody.position.z + forwardOffset
            const x = vehicle.chassisBody.position.x

            shadowLightRef.current.position.z = z
            shadowLightRef.current.target.position.z = z + targetPosition[2]
            shadowLightRef.current.position.x = x
            shadowLightRef.current.target.position.x = x + targetPosition[0]
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
                shadow-camera-near={-25} // z
                shadow-camera-far={35}
                shadow-camera-left={-45} // x back/forwards
                shadow-camera-right={45}
                shadow-camera-top={40} // y
                shadow-camera-bottom={-30}
                shadow-radius={2}
                shadow-blurSamples={8} //8
                color={"#4275ff"}
            />
            <ambientLight intensity={.3} color={"rgba(4, 52, 94, 1)"} />
        </>
    )
}
