import model from "@assets/models/sedan-sports.glb"
import { carMaterial } from "@components/materials/shared"
import Config from "@data/Config"
import { Chassis, useRigidVehicle, Wheel } from "@data/useRigidVehicle"
import { useGLTF } from "@react-three/drei"
import { Box, RigidVehicle, Vec3 } from "cannon-es"
import { ForwardedRef, forwardRef, memo, useImperativeHandle } from "react"
import { Mesh } from "three"
import { GLTF } from "three/examples/jsm/Addons.js"

const width = 1.3
const height = .95
const depth = 2.4
const chassis: Chassis = [
    [new Box(new Vec3(width / 2, height / 2, depth / 2))],
]
const wheelY = -.5
const wheelX = .4
const radius = .3
const wheels: Wheel[] = [
    {
        position: [wheelX, wheelY, .7],
        radius
    },
    {
        position: [-wheelX, wheelY, .7],
        radius
    },
    {
        position: [wheelX, wheelY, -.7],
        radius
    },
    {
        position: [-wheelX, wheelY, -.7],
        radius
    }
]

type GLTFResult = GLTF & {
    nodes: {
        body: Mesh
        spoiler: Mesh
        ["wheel-back"]: Mesh
        ["wheel-back-right"]: Mesh
        ["wheel-front-left"]: Mesh
        ["wheel-front-right"]: Mesh
        ["wheel-back-left"]: Mesh
    }
}

function Sedan(props, ref: ForwardedRef<RigidVehicle>) {
    const { nodes } = useGLTF(model) as unknown as GLTFResult
    const [chassisRef, wheelsRef, vehicle, backWheelsRef] = useRigidVehicle({
        ...props,
        center: [0, .7, 0],
        wheels,
        chassis,
        mass: 2
    })

    useImperativeHandle(ref, () => {
        return vehicle
    }, [vehicle])

    return (
        <>
            <group
                ref={chassisRef}
                dispose={null}
            >
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.spoiler.geometry}
                    position={[0, 0.45, -1.044]}
                >
                    <primitive
                        attach="material"
                        object={carMaterial}
                        wireframe={Config.DEBUG}
                    />
                </mesh>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.body.geometry}
                    position={[0, 0.15, -0.025]}
                >
                    <primitive
                        attach="material"
                        object={carMaterial}
                        wireframe={Config.DEBUG}
                    />
                </mesh>
                <group ref={backWheelsRef}>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes["wheel-back-left"].geometry}
                        position={[wheels[2].position[0], wheels[2].position[1] + .7, wheels[2].position[2]]}
                    >
                        <primitive
                            attach="material"
                            object={carMaterial}
                            wireframe={Config.DEBUG}
                        />
                    </mesh>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes["wheel-back-right"].geometry}
                        position={[wheels[3].position[0], wheels[3].position[1] + .7, wheels[3].position[2]]}
                    >
                        <primitive
                            attach="material"
                            object={carMaterial}
                            wireframe={Config.DEBUG}
                        />
                    </mesh>
                </group>
            </group>
            <group ref={wheelsRef}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes["wheel-front-left"].geometry}
                >
                    <primitive
                        attach="material"
                        object={carMaterial}
                        wireframe={Config.DEBUG}
                    />
                </mesh>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes["wheel-front-right"].geometry}
                >
                    <primitive
                        attach="material"
                        object={carMaterial}
                        wireframe={Config.DEBUG}
                    />
                </mesh>
            </group>
        </>
    )
}

export default memo(forwardRef(Sedan))

useGLTF.preload(model)
