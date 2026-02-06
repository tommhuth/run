import { useStore } from "@data/store"
import { useFrame, useThree } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { useEffect, useRef } from "react"
import { DirectionalLight } from "three"

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
                shadow-mapSize={[768 * viewport.dpr, 768 * viewport.dpr]}
                shadow-camera-near={-25} // z
                shadow-camera-far={35}
                shadow-camera-left={-25} // x back/forwards
                shadow-camera-right={50}
                shadow-camera-top={40} // y
                shadow-camera-bottom={-25}
                shadow-radius={2.5}
                shadow-bias={-.001}
                intensity={8}
                color={"#bee6ff"}
            />
            <hemisphereLight
                color={"#9fd7ff"}
                groundColor={"#0509ff"}
                intensity={.9}
            />
            <ambientLight
                intensity={.4}
                color={"#83acff"}
            />
        </>
    )
}
