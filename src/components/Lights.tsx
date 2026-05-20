import { useStore } from "@data/store"
import { ndelta } from "@data/utils"
import { SoftShadows } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { Tuple3 } from "@src/types/global"
import { useEffect, useRef } from "react"
import { DirectionalLight } from "three"

const forwardOffset = 16
const targetPosition: Tuple3 = [15, -15, 3]

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
        const updateAt = 250

        // update camera shadow position 
        if (shadowLightRef.current && time.current > updateAt && vehicle) {
            const z = vehicle.chassisBody.position.z + forwardOffset
            const x = vehicle.chassisBody.position.x

            shadowLightRef.current.position.z = Math.round(z)
            shadowLightRef.current.target.position.z = Math.round(z + targetPosition[2])
            shadowLightRef.current.position.x = Math.round(x)
            shadowLightRef.current.target.position.x = Math.round(x + targetPosition[0])
            time.current = 0
        } else {
            time.current += ndelta(delta) * 1000
        }
    })

    return (
        <>
            <SoftShadows
                size={16}
                samples={10}
                focus={.025}
            />
            <directionalLight
                position={[0, 0, 0]}
                target-position={targetPosition}
                castShadow
                ref={shadowLightRef}
                shadow-mapSize={[1024, 1024]}
                shadow-camera-near={-25} // top right side
                shadow-camera-far={55} // bottom left
                shadow-camera-left={-35} //backwards z
                shadow-camera-right={45} // forwards z
                shadow-camera-top={40} // top left
                shadow-camera-bottom={-30} // bottom right
                shadow-radius={2.5}
                shadow-bias={-.005}
                intensity={7}
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
