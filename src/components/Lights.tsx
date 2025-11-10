import { useStore } from "@data/store"
import { useFrame, useThree } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { useEffect, useRef } from "react"
import { CameraHelper, DirectionalLight } from "three"

const forwardOffset = 16
const targetPosition: Tuple3 = [15, -20, 3]

export default function Lights() {
    const shadowLightRef = useRef<DirectionalLight>(null)
    const { scene, viewport } = useThree()
    const time = useRef(0)

    useEffect(() => {
        if (!shadowLightRef.current) {
            return
        }

        //scene.add(new CameraHelper(shadowLightRef.current.shadow.camera))
        scene.add(shadowLightRef.current.target)
    }, [scene])

    useFrame((_, delta) => {
        const { player: { vehicle } } = useStore.getState()
        const updateAt = 350

        // update camera shadow position 
        if (shadowLightRef.current && time.current > updateAt && vehicle) {
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
                intensity={1.9}
                shadow-mapSize={[512 * viewport.dpr, 512 * viewport.dpr]}
                shadow-camera-near={-25} // z
                shadow-camera-far={35}
                shadow-camera-left={-25} // x back/forwards
                shadow-camera-right={50}
                shadow-camera-top={40} // y
                shadow-camera-bottom={-25}
                shadow-radius={2}
                shadow-normalBias={.01}
                shadow-blurSamples={8} //8
                color={"#3e71ff"}
            />

            <hemisphereLight
                color={"#c5ebff"}
                groundColor={"#5d05ff"}
                intensity={.2}
            />
            <ambientLight
                intensity={.0510}
                color={"#84fffb"}
            />
        </>
    )
}
